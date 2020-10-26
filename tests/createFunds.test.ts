import { resolveAddress } from '@crestproject/ethers';
import {
  approveInvestmentAmount,
  buyShares,
  ComptrollerLib,
  createNewFund,
  encodeArgs,
  getCurrentFundDeployer,
  KyberAdapter,
} from '@melonproject/melonjs';
import { BigNumber, providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';
import { kyberTakeOrderArgs } from './utils/kyberTakeOrderArgs';
import { callOnIntegrationArgs, integrationManagerActionIds, takeOrderSelector } from './utils/trading';

describe('Walkthrough', () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let signer: Wallet;

  const testnetEndpoint = 'https://testnet.avantgarde.finance/graphql';
  const jsonRpcProvider = 'https://testnet.avantgarde.finance';
  const subgraphStatusEndpoint = 'https://status.thegraph.testnet.avantgarde.finance/graphql';
  const subgraphApi = 'https://thegraph.testnet.avantgarde.finance/subgraphs/name/melonproject/melon';

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

    // create funds
    for (let i = 0; i < 10; i++) {
      const newFundArgs = {
        signer,
        fundDeployer,
        fundOwner: signer.address,
        denominationAsset: deployment.wethToken,
        fundName: `Another WETH Fund with Trade (${new Date().toLocaleTimeString()})`,
        feeManagerConfigData,
        // TODO: fix policyManagerConfigData
        policyManagerConfigData: '0x',
      };

      const createNewFundTx = await createNewFund(newFundArgs);
      const fund = await createNewFundTx();
      expect(fund.fundName).toBe(newFundArgs.fundName);

      // approve ERC20 for contract
      const approveArgs = {
        signer,
        comptrollerProxy: fund.comptrollerProxy,
        denominationAsset: deployment.wethToken,
        investmentAmount: utils.parseEther('20'),
      };

      const approveInvestmentTx = await approveInvestmentAmount(approveArgs);
      const approved = await approveInvestmentTx();

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
    }
  });
});
