import { randomAddress, resolveAddress } from '@crestproject/crestproject';
import {
  callOnIntegrationArgs,
  ComptrollerLib,
  encodeArgs,
  FundDeployer,
  IntegrationManagerActionId,
  KyberAdapter,
  kyberTakeOrderArgs,
  MockKyberPriceSource,
  StandardToken,
  takeOrderSelector,
  VaultLib,
} from '@melonproject/protocol';
import { assertEvent } from '@melonproject/testutils';
import { BigNumber, providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';
import { waitForSubgraph } from './utils/subgraph';
import { fetchAssets } from './utils/subgraph-queries/fetchAssets';
import { fetchFund } from './utils/subgraph-queries/fetchFund';
import { fetchInvestment } from './utils/subgraph-queries/fetchInvestment';
import { fetchRedemption } from './utils/subgraph-queries/fetchRedemption';

describe("Walkthrough a fund's lifecycle", () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let manager: Wallet;
  let investor: Wallet;
  let denominationAsset: StandardToken;
  let comptroller: ComptrollerLib;
  let vault: VaultLib;

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
    manager = new Wallet(managerAddress.privateKey, provider);
    investor = new Wallet(investorAddress.privateKey, provider);

    denominationAsset = new StandardToken(deployment.wethToken, manager);
  });

  it('should create a fund', async () => {
    const fundDeployer = new FundDeployer(deployment.fundDeployer, manager);

    // fees
    const managementFeeSettings = encodeArgs(['uint256'], [BigNumber.from('100000000000000000')]);
    const performanceFeeSettings = encodeArgs(
      ['uint256', 'uint256'],
      [BigNumber.from('100000000000000000'), BigNumber.from('1000000')],
    );

    const fees = [deployment.managementFee, deployment.performanceFee];
    const feesSettingsData = [managementFeeSettings, performanceFeeSettings];

    const feeManagerConfigData = encodeArgs(['address[]', 'bytes[]'], [fees, feesSettingsData]);

    // prepare policies
    const maxConcentration = deployment.maxConcentration;
    const maxConcentrationSettings = encodeArgs(['uint256'], [utils.parseEther('1')]);

    const adapterBlacklist = deployment.adapterBlacklist;
    const adapterBlacklistSettings = encodeArgs(['address[]'], [[deployment.chaiAdapter]]);

    const adapterWhitelist = deployment.adapterWhitelist;
    const adapterWhitelistSettings = encodeArgs(['address[]'], [[deployment.kyberAdapter]]);

    // const assetBlacklist = deployment.assetBlacklist;
    // const assetBlacklistSettings = await encodeArgs(['address[]'], [[deployment.mlnToken]]);

    // const assetWhitelist = deployment.assetWhitelist;
    // const assetWhitelistSettings = await encodeArgs(['address[]'], [[deployment.wethToken, deployment.mlnToken]]);

    const investorWhitelist = deployment.investorWhitelist;
    const investorWhitelistSettings = encodeArgs(
      ['address[]', 'address[]'],
      [[randomAddress(), manager.address, investor.address], []],
    );

    const policies = [maxConcentration, adapterBlacklist, adapterWhitelist, investorWhitelist];
    const policiesSettingsData = [
      maxConcentrationSettings,
      adapterBlacklistSettings,
      adapterWhitelistSettings,
      investorWhitelistSettings,
    ];

    const policyManagerConfigData = encodeArgs(['address[]', 'bytes[]'], [policies, policiesSettingsData]);

    // create fund
    const newFundArgs = {
      fundOwner: manager.address,
      fundName: 'Walkthrough Test Fund',
      denominationAsset,
      sharesActionTimelock: 0,
      allowedBuySharesCallers: [],
      feeManagerConfigData,
      policyManagerConfigData,
    };

    const createFundTx = await fundDeployer.createNewFund
      .args(
        newFundArgs.fundOwner,
        newFundArgs.fundName,
        newFundArgs.denominationAsset,
        newFundArgs.sharesActionTimelock,
        newFundArgs.allowedBuySharesCallers,
        newFundArgs.feeManagerConfigData,
        newFundArgs.policyManagerConfigData,
      )
      .send();

    expect(createFundTx).toBeReceipt();

    const { vaultProxy, comptrollerProxy } = assertEvent(createFundTx, 'NewFundCreated', {
      comptrollerProxy: expect.any(String) as string,
      vaultProxy: expect.any(String) as string,
      fundOwner: newFundArgs.fundOwner,
      fundName: newFundArgs.fundName,
      creator: fundDeployer,
      denominationAsset: newFundArgs.denominationAsset.address,
      sharesActionTimelock: BigNumber.from(newFundArgs.sharesActionTimelock),
      allowedBuySharesCallers: newFundArgs.allowedBuySharesCallers,
      feeManagerConfigData: utils.hexlify(feeManagerConfigData),
      policyManagerConfigData: utils.hexlify(policyManagerConfigData),
    });

    vault = new VaultLib(vaultProxy, provider);
    comptroller = new ComptrollerLib(comptrollerProxy, provider);

    await waitForSubgraph(subgraphStatusEndpoint, createFundTx.blockNumber);
    const subgraphFund = await fetchFund(subgraphApi, vaultProxy.toLowerCase(), createFundTx.blockNumber);

    expect(subgraphFund.name).toBe(newFundArgs.fundName);
  });

  it('should buy shares of the fund', async () => {
    // buy shares
    const approveAmount = 10;
    await denominationAsset
      .connect(investor)
      .approve.args(comptroller.address, utils.parseEther(approveAmount.toString()))
      .send();

    const sharesToBuy = 1;
    const buySharesArgs = {
      investmentAmount: utils.parseEther(sharesToBuy.toString()),
      amguValue: utils.parseEther('1'),
      minSharesAmount: utils.parseEther(sharesToBuy.toString()),
    };

    const bought = await comptroller
      .connect(investor)
      .buyShares.args(investor.address, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .value(buySharesArgs.amguValue)
      .send();

    expect(bought).toBeReceipt();

    await waitForSubgraph(subgraphStatusEndpoint, bought.blockNumber);
    const investmentId = `${vault.address.toLowerCase()}/${investor.address.toLowerCase()}`;
    const subgraphInvestment = await fetchInvestment(subgraphApi, investmentId, bought.blockNumber);
    expect(subgraphInvestment.shares).toEqual(sharesToBuy.toString());
    expect(subgraphInvestment.investor.investor).toBe(true);
  });

  it('should get the share price of the fund', async () => {
    const sharesToBeReceived = await comptroller.buyShares
      .args(investor, utils.parseEther('1'), utils.parseEther('1'))
      .from(investor)
      .call();

    expect(sharesToBeReceived).toEqual(utils.parseEther('1'));
  });

  it('should redeem shares of the fund', async () => {
    // redeem shares
    const redeemed = await comptroller.connect(investor).redeemShares.args().send();

    expect(redeemed).toBeReceipt();

    await waitForSubgraph(subgraphStatusEndpoint, redeemed.blockNumber);

    const transactionHash = redeemed.transactionHash;
    const subgraphRedemption = await fetchRedemption(subgraphApi, transactionHash, redeemed.blockNumber);
    expect(subgraphRedemption.transaction.id).toEqual(transactionHash);
  });

  it('should buy more shares of the fund', async () => {
    // buy more shares
    const approveAmount = 10;
    await denominationAsset
      .connect(investor)
      .approve.args(comptroller.address, utils.parseEther(approveAmount.toString()))
      .send();

    const sharesToBuy = 1;
    const buySharesArgs = {
      investmentAmount: utils.parseEther(sharesToBuy.toString()),
      amguValue: utils.parseEther('1'),
      minSharesAmount: utils.parseEther(sharesToBuy.toString()),
    };

    const bought = await comptroller
      .connect(investor)
      .buyShares.args(investor.address, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .value(buySharesArgs.amguValue)
      .send();

    expect(bought).toBeReceipt();

    await waitForSubgraph(subgraphStatusEndpoint, bought.blockNumber);
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

      const takeOrderTx = comptroller
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
