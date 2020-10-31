import { resolveAddress } from '@crestproject/ethers';
import { ComptrollerLib, Dispatcher, FundDeployer, KyberAdapter, StandardToken } from '@melonproject/protocol';
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

  it("should walkthrough a fund's lifecycle", async () => {
    const dispatcher = new Dispatcher(deployment.dispatcher, provider);
    const fundDeployerAddress = await dispatcher.getCurrentFundDeployer();
    const fundDeployer = new FundDeployer(fundDeployerAddress, provider);
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

    // create funds
    for (let i = 0; i < 100; i++) {
      const newFundArgs = {
        signer,
        fundDeployer,
        fundOwner: signer.address,
        denominationAsset,
        sharesActionTimelock: 1,
        allowedBuySharesCallers: [],
        fundName: `WETH Fund with Trade (${new Date().toLocaleTimeString()})`,
        feeManagerConfigData,
        policyManagerConfigData: '0x',
      };

      const createNewFundResult = await createNewFund(newFundArgs);
      await expect(createNewFundResult.newFundTx).resolves.toBeReceipt();

      const comptroller = new ComptrollerLib(createNewFundResult.comptrollerProxy.address, signer);

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
        adapter: new KyberAdapter(await resolveAddress(deployment.kyberAdapter), signer),
        selector: takeOrderSelector,
        encodedCallArgs: takeOrderArgs,
      });

      const comptrollerProxy = new ComptrollerLib(comptroller.address, signer);
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
