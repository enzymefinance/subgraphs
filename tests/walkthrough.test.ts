import { randomAddress, resolveAddress, SignerWithAddress } from '@crestproject/crestproject';
import {
  adapterBlacklistArgs,
  adapterWhitelistArgs,
  callOnIntegrationArgs,
  ComptrollerLib,
  convertRateToScaledPerSecondRate,
  entranceRateFeeConfigArgs,
  feeManagerConfigArgs,
  FundActionsWrapper,
  FundDeployer,
  IntegrationManagerActionId,
  KyberAdapter,
  kyberTakeOrderArgs,
  managementFeeConfigArgs,
  maxConcentrationArgs,
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

// const kyberEth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

describe("Walkthrough a fund's lifecycle", () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let manager: SignerWithAddress;
  let investor: SignerWithAddress;
  let secondInvestor: SignerWithAddress;
  let denominationAsset: StandardToken;
  let comptrollerProxy: ComptrollerLib;
  let vaultProxy: VaultLib;

  const testnetEndpoint = 'http://localhost:4000/graphql';
  const jsonRpcProvider = 'http://localhost:8545';
  const subgraphStatusEndpoint = 'http://localhost:8030/graphql';
  const subgraphApi = 'http://localhost:8000/subgraphs/name/enzymefinance/enzyme';

  beforeAll(async () => {
    deployment = await fetchDeployment(testnetEndpoint);
    provider = new providers.JsonRpcProvider(jsonRpcProvider);

    const [managerAddress, investorAddress, secondInvestorAddress] = await Promise.all([
      createAccount(testnetEndpoint),
      createAccount(testnetEndpoint),
      createAccount(testnetEndpoint),
    ]);
    manager = await SignerWithAddress.create(new Wallet(managerAddress.privateKey, provider));
    investor = await SignerWithAddress.create(new Wallet(investorAddress.privateKey, provider));
    secondInvestor = await SignerWithAddress.create(new Wallet(secondInvestorAddress.privateKey, provider));

    denominationAsset = new StandardToken(deployment.wethToken, manager);
  });

  it('should create a fund', async () => {
    const fundDeployer = new FundDeployer(deployment.fundDeployer, manager);

    // fees

    const managementFeeRate = utils.parseEther('0.01');
    const scaledPerSecondRate = convertRateToScaledPerSecondRate(managementFeeRate);

    const managementFeeSettings = managementFeeConfigArgs(scaledPerSecondRate);
    const performanceFeeSettings = performanceFeeConfigArgs({
      rate: utils.parseEther('0.1'),
      period: 365 * 24 * 60 * 60,
    });
    // TODO: add entranceRateFees to handlers
    const entranceRateFeeSettings = entranceRateFeeConfigArgs(utils.parseEther('0.05'));

    const feeManagerConfig = feeManagerConfigArgs({
      fees: [deployment.managementFee, deployment.performanceFee, deployment.entranceRateDirectFee],
      settings: [managementFeeSettings, performanceFeeSettings, entranceRateFeeSettings],
    });

    // policies
    const maxConcentrationSettings = maxConcentrationArgs(utils.parseEther('1'));
    const adapterBlacklistSettings = adapterBlacklistArgs([deployment.compoundAdapter, randomAddress()]);
    const adapterWhitelistSettings = adapterWhitelistArgs([
      deployment.kyberAdapter,
      deployment.uniswapV2Adapter,
      deployment.trackedAssetsAdapter,
      deployment.chaiAdapter,
      randomAddress(),
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

  it('should calculate the net share value of an empty fund', async () => {
    const fundActionsWrapper = new FundActionsWrapper(deployment.fundActionsWrapper, provider);

    const netShareValue = await fundActionsWrapper.calcNetShareValueForFund.args(comptrollerProxy).call();

    expect(netShareValue.netShareValue_).toEqBigNumber(utils.parseEther('1'));
  });

  it('should buy shares of the fund', async () => {
    // buy shares
    const investmentAmounts = [utils.parseEther('1')];
    const minSharesAmounts = [utils.parseEther('0.00000000001')];

    const buySharesArgs = {
      investmentAmounts,
      minSharesAmounts,
    };

    const buySharesTx = await buyShares({
      comptrollerProxy,
      signer: investor,
      buyers: [investor],
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

  it('should buy more shares of the fund as another investor', async () => {
    const investmentAmounts = [utils.parseEther('1')];
    const minSharesAmounts = [utils.parseEther('0.00000000001')];

    const buySharesArgs = {
      investmentAmounts,
      minSharesAmounts,
    };

    const buySharesTx = await buyShares({
      comptrollerProxy,
      signer: secondInvestor,
      buyers: [secondInvestor],
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

      // const kyberIntegratee = new MockKyberIntegratee(deployment.kyberIntegratee, manager);

      // const rate = await kyberIntegratee.getExpectedRate(token.id, kyberEth, utils.parseEther('0.1'));
      // console.log(utils.formatEther(rate.expectedRate));

      // const uniswapIntegratee = new MockUniswapV2Integratee(deployment.uniswapV2Integratee, manager);
      // const urate = await uniswapIntegratee.getAmountsOut(utils.parseEther('0.1'), [token.id, deployment.wethToken]);
      // console.log(utils.formatEther(urate[1]));

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

  // it('trades on Uniswap', async () => {
  //   const outgoingAssetAmount = utils.parseEther('0.1');

  //   const outgoingToken = new StandardToken(deployment.wethToken, provider);
  //   const incomingToken = new StandardToken(deployment.)

  //   const path = [deployment.wethToken, deployment.mlnToken];
  //   const routerContract = new IUniswapV2Router2(config.integratees.uniswapV2.router, provider);
  //   const amountsOut = await routerContract.getAmountsOut(outgoingAssetAmount, path);

  //   const takeOrder = await uniswapV2TakeOrder({
  //     comptrollerProxy,
  //     vaultProxy,
  //     integrationManager: new IntegrationManager(deployment.integrationManager, provider),
  //     fundOwner: manager,
  //     uniswapV2Adapter: new UniswapV2Adapter(deployment.uniswapV2Adapter, provider),
  //     path,
  //     minIncomingAssetAmount: amountsOut[1],
  //     outgoingAssetAmount,
  //   });

  //   expect(takeOrder).toCostLessThan(`630000`);
  // });
});
