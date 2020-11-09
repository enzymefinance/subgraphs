import { resolveAddress, SignerWithAddress } from '@crestproject/crestproject';
import {
  adapterBlacklistArgs,
  adapterWhitelistArgs,
  callOnIntegrationArgs,
  ComptrollerLib,
  feeManagerConfigArgs,
  FundDeployer,
  IntegrationManagerActionId,
  KyberAdapter,
  kyberTakeOrderArgs,
  managementFeeConfigArgs,
  maxConcentrationArgs,
  MockKyberPriceSource,
  performanceFeeConfigArgs,
  policyManagerConfigArgs,
  StandardToken,
  takeOrderSelector,
  VaultLib,
} from '@melonproject/protocol';
import { buyShares, createNewFund } from '@melonproject/testutils';
import { providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';
import { waitForSubgraph } from './utils/subgraph';
import { fetchAssets } from './utils/subgraph-queries/fetchAssets';
import { fetchFund } from './utils/subgraph-queries/fetchFund';
import { fetchInvestment } from './utils/subgraph-queries/fetchInvestment';

describe("Walkthrough a fund's lifecycle", () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let manager: SignerWithAddress;
  let investor: SignerWithAddress;
  let denominationAsset: StandardToken;
  let comptrollerProxy: ComptrollerLib;
  let vaultProxy: VaultLib;

  const testnetEndpoint = 'http://localhost:4000/graphql';
  const jsonRpcProvider = 'http://localhost:8545';
  const subgraphStatusEndpoint = 'http://localhost:8030/graphql';
  const subgraphApi = 'http://localhost:8000/subgraphs/name/melonproject/melon';

  beforeAll(async () => {
    deployment = await fetchDeployment(testnetEndpoint);
    provider = new providers.JsonRpcProvider(jsonRpcProvider);

    const [managerAddress, investorAddress] = await Promise.all([
      createAccount(testnetEndpoint),
      createAccount(testnetEndpoint),
    ]);
    manager = await SignerWithAddress.create(new Wallet(managerAddress.privateKey, provider));
    investor = await SignerWithAddress.create(new Wallet(investorAddress.privateKey, provider));

    denominationAsset = new StandardToken(deployment.wethToken, manager);
  });

  it('should create a fund', async () => {
    const fundDeployer = new FundDeployer(deployment.fundDeployer, manager);

    // fees
    const managementFeeSettings = managementFeeConfigArgs(utils.parseEther('0.01'));
    const performanceFeeSettings = performanceFeeConfigArgs({
      rate: utils.parseEther('0.1'),
      period: 365 * 24 * 60 * 60,
    });
    // TODO: add entranceRateFees to handlers
    // const entranceRateFeeSettings = entranceRateFeeConfigArgs(utils.parseEther('0.05'));

    const feeManagerConfig = feeManagerConfigArgs({
      fees: [deployment.managementFee, deployment.performanceFee],
      settings: [managementFeeSettings, performanceFeeSettings],
    });

    // policies
    const maxConcentrationSettings = maxConcentrationArgs(utils.parseEther('1'));
    const adapterBlacklistSettings = adapterBlacklistArgs([deployment.compoundAdapter]);
    const adapterWhitelistSettings = adapterWhitelistArgs([
      deployment.kyberAdapter,
      deployment.uniswapV2Adapter,
      deployment.trackedAssetsAdapter,
      deployment.chaiAdapter,
    ]);

    const policyManagerConfig = policyManagerConfigArgs({
      policies: [deployment.maxConcentration, deployment.adapterBlacklist, deployment.adapterWhitelist],
      settings: [maxConcentrationSettings, adapterBlacklistSettings, adapterWhitelistSettings],
    });

    const createNewFundTx = await createNewFund({
      signer: manager,
      fundDeployer,
      fundName: 'Walkthrough Fund',
      fundOwner: manager,
      denominationAsset,
      feeManagerConfig,
      policyManagerConfig,
    });

    vaultProxy = createNewFundTx.vaultProxy;
    comptrollerProxy = createNewFundTx.comptrollerProxy;

    await waitForSubgraph(subgraphStatusEndpoint, createNewFundTx.receipt.blockNumber);
    const subgraphFund = await fetchFund(
      subgraphApi,
      vaultProxy.address.toLowerCase(),
      createNewFundTx.receipt.blockNumber,
    );

    expect(subgraphFund.name).toBe('Walkthrough Fund');
  });

  it('should buy shares of the fund', async () => {
    // buy shares
    const investmentAmount = utils.parseEther('1');
    const minSharesAmount = utils.parseEther('0.00000000001');

    const buySharesArgs = {
      investmentAmount,
      amguValue: investmentAmount,
      minSharesAmount,
    };

    const buySharesTx = await buyShares({
      comptrollerProxy,
      signer: investor,
      buyer: investor,
      denominationAsset,
      ...buySharesArgs,
    });

    expect(buySharesTx).toBeReceipt();

    await waitForSubgraph(subgraphStatusEndpoint, buySharesTx.blockNumber);
    const investmentId = `${vaultProxy.address.toLowerCase()}/${investor.address.toLowerCase()}`;
    const subgraphInvestment = await fetchInvestment(subgraphApi, investmentId, buySharesTx.blockNumber);
    // expect(subgraphInvestment.shares).toEqual(parseInt(utils.formatEther(investmentAmount)));
    expect(subgraphInvestment.investor.investor).toBe(true);
  });

  it('should buy more shares of the fund', async () => {
    const investmentAmount = utils.parseEther('1');
    const minSharesAmount = utils.parseEther('0.00000000001');

    const buySharesArgs = {
      investmentAmount,
      amguValue: investmentAmount,
      minSharesAmount,
    };

    const buySharesTx = await buyShares({
      comptrollerProxy,
      signer: investor,
      buyer: investor,
      denominationAsset,
      ...buySharesArgs,
    });

    expect(buySharesTx).toBeReceipt();

    await waitForSubgraph(subgraphStatusEndpoint, buySharesTx.blockNumber);
  });

  it('should trade on Kyber', async () => {
    const assets = await fetchAssets(subgraphApi);

    const dai = assets.find((asset) => asset.symbol === 'DAI');
    const mln = assets.find((asset) => asset.symbol === 'MLN');
    const zrx = assets.find((asset) => asset.symbol === 'ZRX');
    const knc = assets.find((asset) => asset.symbol === 'KNC');

    const tokens = [dai, mln, zrx, knc];

    for (let token of tokens) {
      if (!token) {
        continue;
      }

      const kyberEthAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

      // // set price
      const kyberIntegratee = new MockKyberPriceSource(deployment.kyberIntegratee, manager);
      const setRatesTx = kyberIntegratee.setRates
        .args(
          [token.id, kyberEthAddress],
          [kyberEthAddress, token.id],
          [utils.parseEther('0.5'), utils.parseEther('2')],
        )
        .send();

      await expect(setRatesTx).resolves.toBeReceipt();

      const takeOrderArgs = kyberTakeOrderArgs({
        incomingAsset: token.id,
        minIncomingAssetAmount: utils.parseEther('0.000000001'),
        outgoingAsset: deployment.wethToken,
        outgoingAssetAmount: utils.parseEther('0.1'),
      });

      const callArgs = callOnIntegrationArgs({
        adapter: new KyberAdapter(resolveAddress(deployment.kyberAdapter), manager),
        selector: takeOrderSelector,
        encodedCallArgs: takeOrderArgs,
      });

      const takeOrderTx = comptrollerProxy
        .connect(manager)
        .callOnExtension.args(
          resolveAddress(deployment.integrationManager),
          IntegrationManagerActionId.CallOnIntegration,
          callArgs,
        )
        .send();

      await expect(takeOrderTx).resolves.toBeReceipt();
    }
  });
});
