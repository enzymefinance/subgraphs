import { randomAddress, resolveAddress } from '@crestproject/crestproject';
import {
  approveInvestmentAmount,
  buyShares,
  ComptrollerLib,
  createNewFund,
  encodeArgs,
  getCurrentFundDeployer,
  KyberAdapter,
  redeemShares,
} from '@melonproject/melonjs';
import { BigNumber, providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';
import { kyberTakeOrderArgs } from './utils/kyberTakeOrderArgs';
import { waitForSubgraph } from './utils/subgraph';
import { fetchFund } from './utils/subgraph-queries/fetchFund';
import { fetchInvestment } from './utils/subgraph-queries/fetchInvestment';
import { fetchRedemption } from './utils/subgraph-queries/fetchRedemption';
import { callOnIntegrationArgs, integrationManagerActionIds, takeOrderSelector } from './utils/trading';

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
    const fundDeployer = await getCurrentFundDeployer({
      provider,
      dispatcherAddress: deployment.dispatcher,
    });

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
    const blacklistedTokens = [deployment.mlnToken];
    const assetBlacklistSettings = await encodeArgs(['address[]'], [blacklistedTokens]);

    const whitelistedTokens = [deployment.wethToken];
    const assetWhitelistSettings = await encodeArgs(['address[]'], [whitelistedTokens]);

    // const policies = [deployment.assetBlacklist, deployment.assetWhitelist];
    // const policiesSettingsData = [assetBlacklistSettings, assetWhitelistSettings];

    // const policyManagerConfigData = await encodeArgs(['address[]', 'bytes[]'], [policies, policiesSettingsData]);

    // create fund
    const newFundArgs = {
      signer,
      fundDeployer,
      fundOwner: signer.address,
      denominationAsset: deployment.wethToken,
      fundName: 'My Super Fund',
      feeManagerConfigData,
      // TODO: fix policyManagerConfigData
      policyManagerConfigData: '0x',
    };

    const createNewFundTx = await createNewFund(newFundArgs);
    const fund = await createNewFundTx();
    expect(fund.fundName).toBe(newFundArgs.fundName);

    await waitForSubgraph(subgraphStatusEndpoint, fund.__receipt.blockNumber);
    const subgraphFund = await fetchFund(subgraphApi, fund.vaultProxy.toLowerCase(), fund.__receipt.blockNumber);

    expect(subgraphFund.name).toBe(newFundArgs.fundName);

    // approve ERC20 for contract
    const approveArgs = {
      signer,
      comptrollerProxy: fund.comptrollerProxy,
      denominationAsset: deployment.wethToken,
      investmentAmount: utils.parseEther('20'),
    };

    const approveInvestmentTx = await approveInvestmentAmount(approveArgs);
    const approved = await approveInvestmentTx();

    // owner: '0x2225FaD5893A95CCa25D4a001c3336851246ca88',
    // spender: '0x6E9C3A9cC1Cc1F7464D8C66a121699224E0d8323',
    // value: BigNumber { _hex: '0x0de0b6b3a7640000', _isBigNumber: true },
    expect(approved.owner).toBe(await resolveAddress(signer));
    expect(approved.spender).toBe(await resolveAddress(approveArgs.comptrollerProxy));
    expect(BigNumber.from(approved.value)).toEqual(approveArgs.investmentAmount);

    // buy shares
    const sharesToBuy = 1;
    const buySharesArgs = {
      signer,
      comptrollerProxy: fund.comptrollerProxy,
      buyer: signer.address,
      denominationAsset: deployment.wethToken,
      investmentAmount: utils.parseEther(sharesToBuy.toString()),
      minSharesQuantity: utils.parseEther(sharesToBuy.toString()),
    };

    const buySharesTx = await buyShares(buySharesArgs);
    const bought = await buySharesTx();

    await waitForSubgraph(subgraphStatusEndpoint, bought.__receipt.blockNumber);

    const investmentId = `${fund.vaultProxy.toLowerCase()}/${buySharesArgs.buyer.toLowerCase()}`;
    const subgraphInvestment = await fetchInvestment(subgraphApi, investmentId, bought.__receipt.blockNumber);

    expect(subgraphInvestment.shares).toEqual(sharesToBuy.toString());
    expect(subgraphInvestment.investor.investor).toBe(true);

    // get share price
    const ct = new ComptrollerLib(fund.comptrollerProxy, provider);
    const sharePrice = await ct.buyShares
      .args(randomAddress(), utils.parseEther('1'), utils.parseEther('1'))
      .from(signer.address)
      .call();

    expect(sharePrice).toEqual(utils.parseEther('1'));

    // // redeem shares
    const redeemSharesArgs = {
      signer,
      comptrollerProxy: fund.comptrollerProxy,
    };

    const redeemSharesTx = await redeemShares(redeemSharesArgs);
    const redeemed = await redeemSharesTx();

    await waitForSubgraph(subgraphStatusEndpoint, redeemed.__receipt.blockNumber);

    const transactionHash = redeemed.__receipt.transactionHash;
    const subgraphRedemption = await fetchRedemption(subgraphApi, transactionHash, redeemed.__receipt.blockNumber);
    expect(subgraphRedemption.transaction.id).toEqual(transactionHash);

    // buy more shares
    const buyMoreSharesTx = await buyShares(buySharesArgs);
    const boughtMoreShares = await buyMoreSharesTx();

    await waitForSubgraph(subgraphStatusEndpoint, boughtMoreShares.__receipt.blockNumber);

    // trade
    const takeOrderArgs = await kyberTakeOrderArgs({
      incomingAsset: deployment.mlnToken,
      minIncomingAssetAmount: utils.parseEther('0.000000001'),
      outgoingAsset: deployment.wethToken,
      outgoingAssetAmount: utils.parseEther('1'),
    });

    const callArgs = await callOnIntegrationArgs({
      adapter: new KyberAdapter(await resolveAddress(deployment.kyberAdapter), signer),
      selector: takeOrderSelector,
      encodedCallArgs: takeOrderArgs,
    });

    const comptrollerProxy = new ComptrollerLib(await resolveAddress(fund.comptrollerProxy), signer);
    const takeOrderTx = await comptrollerProxy.callOnExtension
      .args(
        await resolveAddress(deployment.integrationManager),
        integrationManagerActionIds.CallOnIntegration,
        callArgs,
      )
      .send(false);

    await expect(takeOrderTx.wait()).resolves.toBeReceipt();

    return takeOrderTx;
  });
});
