import { SignerWithAddress } from '@crestproject/crestproject';
import {
  callOnIntegrationArgs,
  feeManagerConfigArgs,
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
} from '@melonproject/protocol';
import { buyShares, createNewFund } from '@melonproject/testutils';
import { providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';

describe('Walkthrough', () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let manager: SignerWithAddress;
  let investor: SignerWithAddress;

  const testnetEndpoint = 'https://testnet.avantgarde.finance/graphql';
  const jsonRpcProvider = 'https://testnet.avantgarde.finance';

  beforeAll(async () => {
    deployment = await fetchDeployment(testnetEndpoint);
    provider = new providers.JsonRpcProvider(jsonRpcProvider);

    const [managerAddress, investorAddress] = await Promise.all([
      createAccount(testnetEndpoint),
      createAccount(testnetEndpoint),
    ]);

    manager = await SignerWithAddress.create(new Wallet(managerAddress.privateKey, provider));
    investor = await SignerWithAddress.create(new Wallet(investorAddress.privateKey, provider));
  });

  it('should create a number of funds', async () => {
    const denominationAsset = new StandardToken(deployment.wethToken, provider);

    // create funds
    for (let i = 0; i < 100; i++) {
      const fundDeployer = new FundDeployer(deployment.fundDeployer, manager);

      // fees
      const managementFeeSettings = managementFeeConfigArgs(utils.parseEther('0.01'));
      const performanceFeeSettings = performanceFeeConfigArgs({
        rate: utils.parseEther('0.1'),
        period: 365 * 24 * 60 * 60,
      });

      const feeManagerConfig = feeManagerConfigArgs({
        fees: [deployment.managementFee, deployment.performanceFee],
        settings: [managementFeeSettings, performanceFeeSettings],
      });

      // policies
      const maxConcentrationSettings = maxConcentrationArgs(utils.parseEther('1'));

      const policyManagerConfig = policyManagerConfigArgs({
        policies: [deployment.maxConcentration],
        settings: [maxConcentrationSettings],
      });

      const createNewFundTx = await createNewFund({
        signer: manager,
        fundDeployer,
        fundName: `AutoCreate Fund (${new Date().toLocaleTimeString()})`,
        fundOwner: manager,
        denominationAsset,
        feeManagerConfig,
        policyManagerConfig,
      });

      const comptrollerProxy = createNewFundTx.comptrollerProxy;

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

      // trade
      const takeOrderArgs = kyberTakeOrderArgs({
        incomingAsset: deployment.mlnToken,
        minIncomingAssetAmount: utils.parseEther('0.000000001'),
        outgoingAsset: deployment.wethToken,
        outgoingAssetAmount: utils.parseEther('1'),
      });

      const callArgs = callOnIntegrationArgs({
        adapter: new KyberAdapter(deployment.kyberAdapter, manager),
        selector: takeOrderSelector,
        encodedCallArgs: takeOrderArgs,
      });

      const takeOrderTx = await comptrollerProxy.callOnExtension
        .args(deployment.integrationManager, IntegrationManagerActionId.CallOnIntegration, callArgs)
        .send(false);

      await expect(takeOrderTx.wait()).resolves.toBeReceipt();
    }
  });
});
