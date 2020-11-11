import { extractEvent, SignerWithAddress } from '@crestproject/crestproject';
import {
  callOnIntegrationArgs,
  ComptrollerLib,
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
import { providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from '../tests/utils/deployment';
import { Asset, fetchAssets } from '../tests/utils/subgraph-queries/fetchAssets';

(async () => {
  let deployment: Deployment;
  let assets: Asset[];
  let provider: providers.Provider;
  let manager: SignerWithAddress;
  let investor: SignerWithAddress;

  const testnetEndpoint = 'https://testnet.avantgarde.finance/graphql';
  const jsonRpcProvider = 'https://testnet.avantgarde.finance';
  const subgraphApi = 'https://thegraph.testnet.avantgarde.finance/subgraphs/name/melonproject/melon';

  [deployment, assets] = await Promise.all([fetchDeployment(testnetEndpoint), fetchAssets(subgraphApi)]);
  provider = new providers.JsonRpcProvider(jsonRpcProvider);

  const tokens = ['DAI', 'ZRX', 'KNC'].map((symbol) => assets.find((asset) => asset.symbol === symbol));

  const [managerAddress, investorAddress] = await Promise.all([
    createAccount(testnetEndpoint),
    createAccount(testnetEndpoint),
  ]);

  manager = await SignerWithAddress.create(new Wallet(managerAddress.privateKey, provider));
  investor = await SignerWithAddress.create(new Wallet(investorAddress.privateKey, provider));

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

    const createNewFundTx = await fundDeployer
      .connect(manager)
      .createNewFund(
        manager,
        `AutoCreate Fund (${new Date().toLocaleTimeString()})`,
        denominationAsset,
        0,
        [],
        feeManagerConfig,
        policyManagerConfig,
      );

    const events = extractEvent(createNewFundTx, 'NewFundCreated');

    const comptrollerProxyAddress = events[0].args['comptrollerProxy'];
    const comptrollerProxy = new ComptrollerLib(comptrollerProxyAddress, manager);

    // buy shares
    const investmentAmount = utils.parseEther('1');
    const minSharesAmount = utils.parseEther('0.00000000001');

    const buySharesArgs = {
      investmentAmount,
      amguValue: investmentAmount,
      minSharesAmount,
    };

    await denominationAsset.connect(investor).approve(comptrollerProxy, investmentAmount);
    await comptrollerProxy.connect(investor).buyShares(investor, investmentAmount, minSharesAmount);

    // trade
    const takeOrderArgs = kyberTakeOrderArgs({
      incomingAsset: tokens[Math.floor(Math.random() * 3)]!.id,
      minIncomingAssetAmount: utils.parseEther('0.000000001'),
      outgoingAsset: deployment.wethToken,
      outgoingAssetAmount: utils.parseEther('0.5'),
    });

    const callArgs = callOnIntegrationArgs({
      adapter: new KyberAdapter(deployment.kyberAdapter, manager),
      selector: takeOrderSelector,
      encodedCallArgs: takeOrderArgs,
    });

    await comptrollerProxy.callOnExtension(
      deployment.integrationManager,
      IntegrationManagerActionId.CallOnIntegration,
      callArgs,
    );

    console.log(`Created fund #${i}`);
  }
})();
