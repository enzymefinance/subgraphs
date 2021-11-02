import { randomAddress } from '@enzymefinance/ethers';
import { ComptrollerLib, Dispatcher, FundDeployer, StandardToken, VaultLib } from '@enzymefinance/protocol';
import { providers, utils, Wallet } from 'ethers';
import { assertEvent } from './utils/assertions';
import { deployment } from './utils/deployment';

describe('Simple vault with deposits and a transfers', () => {
  const ethereumNetwork = process.env.ETHEREUM_NETWORK;
  const jsonRpcProvider = process.env.JSONRPC_ENDPOINT;
  const privateKey = process.env.PRIVATE_KEY;

  const provider = new providers.StaticJsonRpcProvider(jsonRpcProvider, ethereumNetwork);
  let signer = new Wallet(privateKey, provider);

  const deploymentEndpoint = process.env.DEPLOYMENT_ENDPOINT;

  let dispatcher: Dispatcher;
  let fundDeployerAddress: string;
  let fundDeployer: FundDeployer;

  beforeAll(async () => {
    dispatcher = new Dispatcher(deployment.dispatcher, provider);
    fundDeployerAddress = await dispatcher.getCurrentFundDeployer();
    fundDeployer = new FundDeployer(fundDeployerAddress, signer);
  });

  it('should create a vault, deposit and transfer', async () => {
    const denominationAsset = new StandardToken(deployment.wethToken, signer); // WETH

    // create fund

    const newFundArgs = {
      fundName: 'Test Fund with Shares Transfer ' + Math.floor(Math.random() * 1000000),
      sharesActionTimelock: 0,
      feeManagerConfigData: '0x',
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

    const vaultProxy = new VaultLib(fundCreatedArgs.vaultProxy, signer);

    // set Freely transferable shares
    await vaultProxy.setFreelyTransferableShares.args().send();

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
      .args(buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .send();

    assertEvent(sharesBought, 'SharesBought', {
      buyer: await signer.getAddress(),
      investmentAmount: buySharesArgs.investmentAmount,
    });

    // Transfer

    const numberOfShares = await vaultProxy.balanceOf(signer.address);
    await vaultProxy.transfer.args(randomAddress(), numberOfShares.div(2)).send();
  });
});
