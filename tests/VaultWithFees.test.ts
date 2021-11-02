import { randomAddress } from '@enzymefinance/ethers';
import {
  ComptrollerLib,
  convertRateToScaledPerSecondRate,
  Dispatcher,
  entranceRateDirectFeeConfigArgs,
  exitRateDirectFeeConfigArgs,
  feeManagerConfigArgs,
  FundDeployer,
  managementFeeConfigArgs,
  performanceFeeConfigArgs,
  StandardToken,
} from '@enzymefinance/protocol';
import { BigNumber, providers, utils, Wallet } from 'ethers';
import { assertEvent } from './utils/assertions';
import { deployment } from './utils/deployment';

describe('Vault with Fees', () => {
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

  beforeAll(async () => {
    dispatcher = new Dispatcher(deployment.dispatcher, provider);
    fundDeployerAddress = await dispatcher.getCurrentFundDeployer();
    fundDeployer = new FundDeployer(fundDeployerAddress, signer);
  });

  it('should create a vault with fees', async () => {
    const denominationAsset = new StandardToken(deployment.wethToken, signer); // WETH

    // Fee configuration

    const managementFeeSettings = managementFeeConfigArgs({
      scaledPerSecondRate: convertRateToScaledPerSecondRate(utils.parseUnits('1', 16)),
      recipient: randomAddress(),
    });

    const performanceFeeSettings = performanceFeeConfigArgs({
      rate: BigNumber.from(1000),
      period: BigNumber.from(60 * 60 * 24 * 365),
      recipient: randomAddress(),
    });

    const entranceRateDirectFeeSettings = entranceRateDirectFeeConfigArgs({
      rate: BigNumber.from(500),
      recipient: randomAddress(),
    });

    const exitRateDirectFeeSettings = exitRateDirectFeeConfigArgs({
      inKindRate: BigNumber.from(40),
      specificAssetsRate: BigNumber.from(499),
      recipient: randomAddress(),
    });

    const fees = [
      deployment.managementFee,
      deployment.performanceFee,
      deployment.entranceRateDirectFee,
      deployment.exitRateDirectFee,
    ];
    const settings = [
      managementFeeSettings,
      performanceFeeSettings,
      entranceRateDirectFeeSettings,
      exitRateDirectFeeSettings,
    ];

    const feeManagerConfigData = feeManagerConfigArgs({ fees, settings });

    // create fund

    const newFundArgs = {
      fundName: 'Vault with Fees And Investments ' + Math.floor(Math.random() * 1000000),
      sharesActionTimelock: 0,
      feeManagerConfigData,
      policyManagerConfigData: '0x',
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

    // buy shares
    const approveAmount = 10;
    const sharesToBuy = 1;
    const buySharesArgs = {
      comptrollerProxy,
      signer,
      buyer: signer.address,
      denominationAsset,
      investmentAmount: utils.parseEther(sharesToBuy.toString()),
      minSharesAmount: utils.parseEther(sharesToBuy.toString()),
    };

    await denominationAsset.approve.args(comptrollerProxy, utils.parseEther(approveAmount.toString())).send();

    const sharesBought = await comptrollerProxy.buyShares
      .args(buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount.mul(90).div(100))
      .send();

    assertEvent(sharesBought, 'SharesBought', {
      buyer: await signer.getAddress(),
      investmentAmount: buySharesArgs.investmentAmount,
    });

    // Redeem

    const redeemed = await comptrollerProxy.redeemSharesInKind
      .args(signer, utils.parseEther(sharesToBuy.toString()).div(2), [], [])
      .gas(300000)
      .send();

    // buy more shares

    await denominationAsset.approve.args(comptrollerProxy, buySharesArgs.investmentAmount).send();

    const boughtMoreShares = await comptrollerProxy.buyShares
      .args(buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount.mul(99).div(100))
      .send();
  });
});
