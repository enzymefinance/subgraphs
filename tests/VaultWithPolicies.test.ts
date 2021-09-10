import { randomAddress } from '@enzymefinance/ethers';
import {
  allowedAdapterIncomingAssetsPolicyArgs,
  allowedDepositRecipientsPolicyArgs,
  ComptrollerLib,
  Dispatcher,
  FundDeployer,
  guaranteedRedemptionPolicyArgs,
  minMaxInvestmentPolicyArgs,
  policyManagerConfigArgs,
  StandardToken,
} from '@enzymefinance/protocol';
import { BigNumber, providers, utils, Wallet } from 'ethers';
import { assertEvent } from './utils/assertions';
import { Deployment, fetchDeployment } from './utils/deployment';

describe('Vault with Policies', () => {
  const ethereumNetwork = process.env.ETHEREUM_NETWORK;
  const jsonRpcProvider = process.env.JSONRPC_ENDPOINT;
  const privateKey = process.env.PRIVATE_KEY;

  const provider = new providers.StaticJsonRpcProvider(jsonRpcProvider, ethereumNetwork);
  let signer = new Wallet(privateKey, provider);

  const subgraphStatusEndpoint = process.env.SUBGRAPH_STATUS_ENDPOINT;
  const subgraphEndpoint = process.env.SUBGRAPH_ENDPOINT;
  const subgraphName = process.env.SUBGRAPH_NAME;

  const deploymentEndpoint = process.env.DEPLOYMENT_ENDPOINT;

  let dispatcher: Dispatcher;
  let fundDeployerAddress: string;
  let fundDeployer: FundDeployer;

  let deployment: Deployment;
  let assets: string[];

  beforeAll(async () => {
    const deploymentWithAssets = await fetchDeployment(deploymentEndpoint);

    deployment = deploymentWithAssets.contracts;
    assets = deploymentWithAssets.assets;

    dispatcher = new Dispatcher(deployment.dispatcher, provider);
    fundDeployerAddress = await dispatcher.getCurrentFundDeployer();
    fundDeployer = new FundDeployer(fundDeployerAddress, signer);
  });

  it('should create a vault with policies', async () => {
    const denominationAsset = new StandardToken(deployment.wethToken, signer); // WETH

    // Fee configuration

    const allowedAdapterIncomingAssetsPolicySettings = allowedAdapterIncomingAssetsPolicyArgs([
      deployment.wethToken,
      deployment.mlnToken,
    ]);

    const allowedDepositRecipientsPolicySettings = allowedDepositRecipientsPolicyArgs({
      investorsToAdd: [randomAddress(), randomAddress()],
    });

    const guaranteedRedemptionPolicySettings = guaranteedRedemptionPolicyArgs({
      startTimestamp: BigNumber.from(1000),
      duration: BigNumber.from(2000),
    });

    const minMaxInvestmentPolicySettings = minMaxInvestmentPolicyArgs({
      minInvestmentAmount: utils.parseEther('10'),
      maxInvestmentAmount: utils.parseEther('1000000'),
    });

    const policies = [
      deployment.allowedAdapterIncomingAssetsPolicy,
      deployment.allowedDepositRecipientsPolicy,
      deployment.guaranteedRedemptionPolicy,
      deployment.minMaxInvestmentPolicy,
    ];
    const settings = [
      allowedAdapterIncomingAssetsPolicySettings,
      allowedDepositRecipientsPolicySettings,
      guaranteedRedemptionPolicySettings,
      minMaxInvestmentPolicySettings,
    ];

    const policyManagerConfigData = policyManagerConfigArgs({ policies, settings });

    // create fund

    const newFundArgs = {
      fundName: 'Vault with Policies ' + Math.floor(Math.random() * 1000000),
      sharesActionTimelock: 0,
      feeManagerConfigData: '0x',
      policyManagerConfigData,
    };

    const fundCreated = await fundDeployer.createNewFund(
      signer,
      newFundArgs.fundName,
      denominationAsset,
      newFundArgs.sharesActionTimelock,
      newFundArgs.feeManagerConfigData,
      newFundArgs.policyManagerConfigData,
    );

    const comptrollerDeployedArgs = assertEvent(fundCreated, 'ComptrollerProxyDeployed', {
      creator: signer,
      comptrollerProxy: expect.any(String) as string,
      denominationAsset,
      sharesActionTimelock: newFundArgs.sharesActionTimelock,
      feeManagerConfigData: utils.hexlify(newFundArgs.feeManagerConfigData),
      policyManagerConfigData: utils.hexlify(newFundArgs.policyManagerConfigData),
    });

    const comptrollerProxy = new ComptrollerLib(comptrollerDeployedArgs.comptrollerProxy, signer);

    const fundCreatedArgs = assertEvent(fundCreated, 'NewFundCreated', {
      vaultProxy: expect.any(String) as string,
    });
  });
});
