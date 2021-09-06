import { ComptrollerLib, Dispatcher, FundDeployer, StandardToken } from '@enzymefinance/protocol';
import { providers, utils, Wallet } from 'ethers';
import { assertEvent } from './utils/assertions';
import { waitForSubgraph } from './utils/subgraph';
// import { Deployment } from './utils/deployment';
// import { waitForSubgraph } from './utils/subgraph';
// import { fetchAssets } from './utils/subgraph-queries/fetchAssets';
// import { fetchFund } from './utils/subgraph-queries/fetchFund';
import { fetchDeposit } from './utils/subgraph-queries/fetchDeposit';
// import { fetchRedemption } from './utils/subgraph-queries/fetchRedemption';

describe('Walkthrough', () => {
  const ethereumNetwork = process.env.ETHEREUM_NETWORK;
  const jsonRpcProvider = process.env.JSONRPC_ENDPOINT;
  const privateKey = process.env.PRIVATE_KEY;

  const provider = new providers.StaticJsonRpcProvider(jsonRpcProvider, ethereumNetwork);
  let signer = new Wallet(privateKey, provider);

  const subgraphStatusEndpoint = 'https://api.thegraph.com/index-node/graphql';
  const subgraphApi = 'https://api.thegraph.com/subgraphs/name/enzymefinance/enzyme-core-kovan';
  const subgraphName = 'enzymefinance/enzyme-core-kovan';

  it("should walkthrough a fund's lifecycle", async () => {
    const dispatcher = new Dispatcher('0xdA048Eb415a8d43cAE7802350ADE332CF4211429', provider);
    const fundDeployerAddress = await dispatcher.getCurrentFundDeployer();
    const fundDeployer = new FundDeployer(fundDeployerAddress, signer);
    const denominationAsset = new StandardToken('0xd0a1e359811322d97991e03f863a0c30c2cf029c', signer);

    // create fund

    const newFundArgs = {
      fundName: 'Test Fund ' + Math.floor(Math.random() * 1000000),
      sharesActionTimelock: 1000,
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

    // buy shares
    const approveAmount = 10;
    const sharesToBuy = 1;
    const buySharesArgs = {
      comptrollerProxy,
      signer,
      buyer: signer.address,
      denominationAsset,
      investmentAmount: utils.parseEther(sharesToBuy.toString()),
      amguValue: utils.parseEther('1'),
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

    await waitForSubgraph(subgraphStatusEndpoint, subgraphName, sharesBought.blockNumber);

    const investmentId = `${fundCreatedArgs.vaultProxy.toLowerCase()}/${buySharesArgs.buyer.toLowerCase()}`;
    const subgraphInvestment = await fetchDeposit(subgraphApi, investmentId, sharesBought.blockNumber);

    expect(subgraphInvestment.shares).toEqual(sharesToBuy.toString());
    expect(subgraphInvestment.depositor.isDepositor).toBe(true);

    // // Redeem

    // const redeemed = await comptrollerProxy.redeemSharesInKind
    //   .args(signer, utils.parseEther(sharesToBuy.toString()).div(2), [], [])
    //   .send();

    // await waitForSubgraph(subgraphStatusEndpoint, subgraphName, redeemed.blockNumber);

    // const transactionHash = redeemed.transactionHash;
    // const subgraphRedemption = await fetchRedemption(subgraphApi, transactionHash, redeemed.blockNumber);
    // expect(subgraphRedemption.transaction.id).toEqual(transactionHash);

    // // buy more shares

    // await denominationAsset.approve.args(comptrollerProxy, buySharesArgs.investmentAmount).send();

    // const boughtMoreShares = await comptrollerProxy.buyShares
    //   .args(buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
    //   .send();

    // await waitForSubgraph(subgraphStatusEndpoint, subgraphName, boughtMoreShares.blockNumber);
  });
});
