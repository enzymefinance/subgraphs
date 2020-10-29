import { resolveAddress } from '@crestproject/crestproject';
import {
  ComptrollerLib,
  Dispatcher,
  FundDeployer,
  KyberAdapter,
  MockKyberPriceSource,
  StandardToken,
} from '@melonproject/protocol';
import {
  callOnIntegrationArgs,
  createNewFund,
  encodeArgs,
  integrationManagerActionIds,
  kyberTakeOrderArgs,
  takeOrderSelector,
} from '@melonproject/testutils';
import { BigNumber, providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';
import { waitForSubgraph } from './utils/subgraph';
import { fetchAssets } from './utils/subgraph-queries/fetchAssets';
import { fetchFund } from './utils/subgraph-queries/fetchFund';
import { fetchInvestment } from './utils/subgraph-queries/fetchInvestment';
import { fetchRedemption } from './utils/subgraph-queries/fetchRedemption';

describe('Walkthrough', () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let signer: Wallet;

  const testnetEndpoint = 'http://localhost:4000/graphql';
  const jsonRpcProvider = 'http://localhost:8545';
  const subgraphStatusEndpoint = 'http://localhost:8030/graphql';
  const subgraphApi = 'http://localhost:8000/subgraphs/name/melonproject/melon';

  beforeAll(async () => {
    const account = await createAccount(testnetEndpoint);
    deployment = await fetchDeployment(testnetEndpoint);
    provider = new providers.JsonRpcProvider(jsonRpcProvider);
    signer = new Wallet(account.privateKey, provider);
  });

  it("should walkthrough a fund's lifecycle", async () => {
    const dispatcher = new Dispatcher(deployment.dispatcher, provider);
    const fundDeployerAddress = await dispatcher.getCurrentFundDeployer();
    const fundDeployer = new FundDeployer(fundDeployerAddress, signer);
    const denominationAsset = new StandardToken(deployment.wethToken, signer);

    // create fund with fees

    const managementFeeSettings = await encodeArgs(['uint256'], [BigNumber.from('100000000000000000')]);

    const performanceFeeSettings = await encodeArgs(
      ['uint256', 'uint256'],
      [BigNumber.from('100000000000000000'), BigNumber.from('1000000')],
    );

    const fees = [deployment.managementFee, deployment.performanceFee];
    const feesSettingsData = [managementFeeSettings, performanceFeeSettings];

    const feeManagerConfigData = await encodeArgs(['address[]', 'bytes[]'], [fees, feesSettingsData]);

    // prepare policies
    const maxConcentration = deployment.maxConcentration;
    const maxConcentrationSettings = await encodeArgs(['uint256'], [utils.parseEther('1')]);

    const policies = [maxConcentration];
    const policiesSettingsData = [maxConcentrationSettings];

    const policyManagerConfigData = await encodeArgs(['address[]', 'bytes[]'], [policies, policiesSettingsData]);

    // create fund
    const newFundArgs = {
      signer,
      fundDeployer,
      denominationAsset,
      sharesActionTimelock: 1,
      fundOwner: signer.address,
      allowedBuySharesCallers: [],
      fundName: 'My Super Fund',
      feeManagerConfigData,
      policyManagerConfigData,
    };

    const { comptrollerProxy, newFundTx, vaultProxy } = await createNewFund(newFundArgs);

    await waitForSubgraph(subgraphStatusEndpoint, (await newFundTx).blockNumber);
    const subgraphFund = await fetchFund(subgraphApi, vaultProxy.address.toLowerCase(), (await newFundTx).blockNumber);

    expect(subgraphFund.name).toBe(newFundArgs.fundName);

    const comptroller = new ComptrollerLib(comptrollerProxy.address, signer);

    // buy shares
    const approveAmount = 10;
    const sharesToBuy = 1;
    const buySharesArgs = {
      comptroller,
      signer,
      buyer: signer.address,
      denominationAsset,
      investmentAmount: utils.parseEther(sharesToBuy.toString()),
      amguValue: utils.parseEther('1'),
      minSharesAmount: utils.parseEther(sharesToBuy.toString()),
    };

    await denominationAsset.approve.args(comptrollerProxy, utils.parseEther(approveAmount.toString())).send();

    const bought = await comptroller.buyShares
      .args(buySharesArgs.buyer, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .value(buySharesArgs.amguValue)
      .send();

    await waitForSubgraph(subgraphStatusEndpoint, bought.blockNumber);

    const investmentId = `${vaultProxy.address.toLowerCase()}/${buySharesArgs.buyer.toLowerCase()}`;
    const subgraphInvestment = await fetchInvestment(subgraphApi, investmentId, bought.blockNumber);

    expect(subgraphInvestment.shares).toEqual(sharesToBuy.toString());
    expect(subgraphInvestment.investor.investor).toBe(true);

    // get share price

    // const sharePrice = await comptroller.buyShares
    //   .args(signer.address, utils.parseEther('1'), utils.parseEther('1'))
    //   .from(signer.address)
    //   .call();

    // expect(sharePrice).toEqual(utils.parseEther('1'));

    // redeem shares
    const redeemSharesArgs = {
      signer,
      comptrollerProxy,
    };

    const redeemed = await comptroller.redeemShares.args().send();

    await waitForSubgraph(subgraphStatusEndpoint, redeemed.blockNumber);

    const transactionHash = redeemed.transactionHash;
    const subgraphRedemption = await fetchRedemption(subgraphApi, transactionHash, redeemed.blockNumber);
    expect(subgraphRedemption.transaction.id).toEqual(transactionHash);

    // buy more shares
    await denominationAsset.approve.args(comptrollerProxy, buySharesArgs.investmentAmount).send();

    const boughtMoreShares = await comptroller.buyShares
      .args(buySharesArgs.buyer, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .value(buySharesArgs.amguValue)
      .send();

    await waitForSubgraph(subgraphStatusEndpoint, boughtMoreShares.blockNumber);

    // trades

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
      const kyberIntegratee = new MockKyberPriceSource(deployment.kyberIntegratee, signer);
      const setRatesTx = await kyberIntegratee.setRates
        .args(
          [token.id, kyberEthAddress],
          [kyberEthAddress, token.id],
          [utils.parseEther('0.5'), utils.parseEther('2')],
        )
        .send(false);

      await expect(setRatesTx.wait()).resolves.toBeReceipt();

      // const rate = await kyberIntegratee.assetToAssetRate(deployment.wethToken, token.id);

      // console.log(utils.formatEther(rate));

      const takeOrderArgs = await kyberTakeOrderArgs({
        incomingAsset: token.id,
        minIncomingAssetAmount: utils.parseEther('0.000000001'),
        outgoingAsset: deployment.wethToken,
        outgoingAssetAmount: utils.parseEther('0.1'),
      });

      const callArgs = await callOnIntegrationArgs({
        adapter: new KyberAdapter(await resolveAddress(deployment.kyberAdapter), signer),
        selector: takeOrderSelector,
        encodedCallArgs: takeOrderArgs,
      });

      const takeOrderTx = await comptroller.callOnExtension
        .args(
          await resolveAddress(deployment.integrationManager),
          integrationManagerActionIds.CallOnIntegration,
          callArgs,
        )
        .send(false);

      await expect(takeOrderTx.wait()).resolves.toBeReceipt();
    }
  });
});
