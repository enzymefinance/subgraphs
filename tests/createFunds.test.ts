import { resolveAddress } from '@crestproject/ethers';
import {
  callOnIntegrationArgs,
  ComptrollerLib,
  Dispatcher,
  encodeArgs,
  FundDeployer,
  IntegrationManagerActionId,
  KyberAdapter,
  kyberTakeOrderArgs,
  StandardToken,
  takeOrderSelector,
} from '@melonproject/protocol';
import { assertEvent } from '@melonproject/testutils';
import { BigNumber, providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';

describe('Walkthrough', () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let signer: Wallet;

  const testnetEndpoint = 'https://testnet.avantgarde.finance/graphql';
  const jsonRpcProvider = 'https://testnet.avantgarde.finance';

  beforeAll(async () => {
    const account = await createAccount(testnetEndpoint);
    deployment = await fetchDeployment(testnetEndpoint);
    provider = new providers.JsonRpcProvider(jsonRpcProvider);
    signer = new Wallet(account.privateKey, provider);
  });

  xit('should create a number of funds', async () => {
    const dispatcher = new Dispatcher(deployment.dispatcher, provider);
    const fundDeployerAddress = await dispatcher.getCurrentFundDeployer();
    const fundDeployer = new FundDeployer(fundDeployerAddress, provider);
    const denominationAsset = new StandardToken(deployment.wethToken, signer);

    // create fund with fees

    const managementFeeSettings = encodeArgs(['uint256'], [BigNumber.from('100000000000000000')]);

    const performanceFeeSettings = encodeArgs(
      ['uint256', 'uint256'],
      [BigNumber.from('100000000000000000'), BigNumber.from('1000000')],
    );

    const fees = [deployment.managementFee, deployment.performanceFee];
    const feesSettingsData = [managementFeeSettings, performanceFeeSettings];

    const feeManagerConfigData = encodeArgs(['address[]', 'bytes[]'], [fees, feesSettingsData]);

    // create funds
    for (let i = 0; i < 100; i++) {
      // create fund
      const newFundArgs = {
        fundOwner: signer.address,
        fundName: `WETH Fund with Trade (${new Date().toLocaleTimeString()})`,
        denominationAsset,
        sharesActionTimelock: 0,
        allowedBuySharesCallers: [],
        feeManagerConfigData,
        policyManagerConfigData: 'Ox',
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

      const { comptrollerProxy } = assertEvent(createFundTx, 'NewFundCreated', {
        comptrollerProxy: expect.any(String) as string,
        vaultProxy: expect.any(String) as string,
        fundOwner: newFundArgs.fundOwner,
        fundName: newFundArgs.fundName,
        denominationAsset: newFundArgs.denominationAsset.address,
        sharesActionTimelock: BigNumber.from(newFundArgs.sharesActionTimelock),
        allowedBuySharesCallers: newFundArgs.allowedBuySharesCallers,
        feeManagerConfigData: utils.hexlify(feeManagerConfigData),
        policyManagerConfigData: utils.hexlify('0x'),
      });

      const comptroller = new ComptrollerLib(comptrollerProxy, signer);

      // approve ERC20 for contract
      await denominationAsset.approve.args(comptroller.address, utils.parseEther('20')).send();

      // buy shares
      const sharesToBuy = 1;
      const buySharesArgs = {
        signer,
        comptrollerProxy: comptroller,
        buyer: signer.address,
        denominationAsset,
        investmentAmount: utils.parseEther(sharesToBuy.toString()),
        minSharesAmount: utils.parseEther(sharesToBuy.toString()),
        amguValue: utils.parseEther('1'),
      };

      const bought = await comptroller.buyShares
        .args(buySharesArgs.buyer, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
        .value(buySharesArgs.amguValue)
        .send(false);
      await expect(bought.wait()).resolves.toBeReceipt();

      // trade
      const takeOrderArgs = await kyberTakeOrderArgs({
        incomingAsset: deployment.mlnToken,
        minIncomingAssetAmount: utils.parseEther('0.000000001'),
        outgoingAsset: deployment.wethToken,
        outgoingAssetAmount: utils.parseEther('1'),
      });

      const callArgs = await callOnIntegrationArgs({
        adapter: new KyberAdapter(resolveAddress(deployment.kyberAdapter), signer),
        selector: takeOrderSelector,
        encodedCallArgs: takeOrderArgs,
      });

      const takeOrderTx = await comptroller.callOnExtension
        .args(resolveAddress(deployment.integrationManager), IntegrationManagerActionId.CallOnIntegration, callArgs)
        .send(false);

      await expect(takeOrderTx.wait()).resolves.toBeReceipt();
    }
  });
});
