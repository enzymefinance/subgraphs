import { randomAddress } from '@crestproject/crestproject';
import {
  ComptrollerLib,
  encodeArgs,
  FundDeployer,
  PolicyManager,
  StandardToken,
  VaultLib,
} from '@melonproject/protocol';
import { assertEvent } from '@melonproject/testutils';
import { BigNumber, providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';
import { waitForSubgraph } from './utils/subgraph';
import { fetchFund } from './utils/subgraph-queries/fetchFund';
import { fetchInvestment } from './utils/subgraph-queries/fetchInvestment';

describe('InvestorWhitelist handling after fund creation', () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let manager: Wallet;
  let investor: Wallet;
  let secondInvestor: Wallet;
  let denominationAsset: StandardToken;
  let comptroller: ComptrollerLib;
  let vault: VaultLib;
  let policyManager: PolicyManager;

  const testnetEndpoint = 'http://localhost:4000/graphql';
  const jsonRpcProvider = 'http://localhost:8545';
  const subgraphStatusEndpoint = 'http://localhost:8030/graphql';
  const subgraphApi = 'http://localhost:8000/subgraphs/name/melonproject/melon';

  beforeAll(async () => {
    deployment = await fetchDeployment(testnetEndpoint);
    provider = new providers.JsonRpcProvider(jsonRpcProvider);

    policyManager = new PolicyManager(deployment.policyManager, provider);
    denominationAsset = new StandardToken(deployment.wethToken, provider);

    const [managerAddress, investorAddress, secondInvestorAddress] = await Promise.all([
      createAccount(testnetEndpoint),
      createAccount(testnetEndpoint),
      createAccount(testnetEndpoint),
    ]);
    manager = new Wallet(managerAddress.privateKey, provider);
    investor = new Wallet(investorAddress.privateKey, provider);
    secondInvestor = new Wallet(secondInvestorAddress.privateKey, provider);
  });

  it('should create a fund without investor whitelist policy', async () => {
    const fundDeployer = new FundDeployer(deployment.fundDeployer, provider);

    // create fund
    const newFundArgs = {
      fundOwner: manager.address,
      fundName: 'Whitelist Test Fund',
      denominationAsset,
      sharesActionTimelock: 0,
      allowedBuySharesCallers: [],
      feeManagerConfigData: '0x',
      policyManagerConfigData: '0x',
    };

    const createFundTx = await fundDeployer
      .connect(manager)
      .createNewFund.args(
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

    const { vaultProxy, comptrollerProxy } = assertEvent(createFundTx, 'NewFundCreated', {
      comptrollerProxy: expect.any(String) as string,
      vaultProxy: expect.any(String) as string,
      fundOwner: newFundArgs.fundOwner,
      fundName: newFundArgs.fundName,
      denominationAsset: newFundArgs.denominationAsset.address,
      sharesActionTimelock: BigNumber.from(newFundArgs.sharesActionTimelock),
      allowedBuySharesCallers: newFundArgs.allowedBuySharesCallers,
      feeManagerConfigData: utils.hexlify('0x'),
      policyManagerConfigData: utils.hexlify('0x'),
    });

    vault = new VaultLib(vaultProxy, provider);
    comptroller = new ComptrollerLib(comptrollerProxy, manager);

    await waitForSubgraph(subgraphStatusEndpoint, createFundTx.blockNumber);
    const subgraphFund = await fetchFund(subgraphApi, vaultProxy.toLowerCase(), createFundTx.blockNumber);

    expect(subgraphFund.name).toBe(newFundArgs.fundName);
  });

  it('should enable the policy for the fund', async () => {
    // enable investor whitelist policy
    const investorWhitelistSettings = encodeArgs(
      ['address[]', 'address[]'],
      [
        [
          randomAddress(),
          randomAddress(),
          randomAddress(),
          randomAddress(),
          randomAddress(),
          randomAddress(),
          randomAddress(),
          randomAddress(),
          randomAddress(),
          randomAddress(),
          randomAddress(),
          investor.address,
        ],
        [],
      ],
    );

    const enabled = await policyManager
      .connect(manager)
      .enablePolicyForFund.args(comptroller.address, deployment.investorWhitelist, investorWhitelistSettings)
      .send(false);

    await expect(enabled.wait()).resolves.toBeReceipt();
  });

  it('should buy shares as a whitelisted investor', async () => {
    // buy shares (investor on whitelist)
    const sharesToBuy = 1;
    const buySharesArgs = {
      investmentAmount: utils.parseEther(sharesToBuy.toString()),
      amguValue: utils.parseEther('1'),
      minSharesAmount: utils.parseEther(sharesToBuy.toString()),
    };

    await denominationAsset.connect(investor).approve.args(comptroller.address, utils.parseEther('1')).send();

    const bought = await comptroller
      .connect(investor)
      .buyShares.args(investor.address, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .value(buySharesArgs.amguValue)
      .send();

    expect(bought).toBeReceipt();

    await waitForSubgraph(subgraphStatusEndpoint, bought.blockNumber);
    const investmentId = `${vault.address.toLowerCase()}/${investor.address.toLowerCase()}`;
    const subgraphInvestment = await fetchInvestment(subgraphApi, investmentId, bought.blockNumber);
    expect(subgraphInvestment.shares).toEqual(sharesToBuy.toString());
    expect(subgraphInvestment.investor.investor).toBe(true);
  });

  it('should fail to buy shares as a non-whitelisted investor', async () => {
    const sharesToBuy = 1;
    const buySharesArgs = {
      investmentAmount: utils.parseEther(sharesToBuy.toString()),
      amguValue: utils.parseEther('1'),
      minSharesAmount: utils.parseEther(sharesToBuy.toString()),
    };

    await denominationAsset.connect(secondInvestor).approve.args(comptroller, utils.parseEther('1')).send();

    const boughtByOtherInvestor = comptroller
      .connect(secondInvestor)
      .buyShares.args(secondInvestor.address, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .value(buySharesArgs.amguValue)
      .send();

    expect(boughtByOtherInvestor).rejects.toBeRevertedWith('Rule evaluated to false: INVESTOR_WHITELIST');
  });

  it('should disable the policy', async () => {
    // disable policy
    const disabled = policyManager
      .connect(manager)
      .disablePolicyForFund.args(comptroller.address, deployment.investorWhitelist)
      .send();

    await expect(disabled).resolves.toBeReceipt();
  });

  it('should successfully buy shares as a non-whitelisted investor after disabling the policy', async () => {
    const sharesToBuy = 1;
    const buySharesArgs = {
      investmentAmount: utils.parseEther(sharesToBuy.toString()),
      amguValue: utils.parseEther('1'),
      minSharesAmount: utils.parseEther(sharesToBuy.toString()),
    };

    await denominationAsset.connect(secondInvestor).approve.args(comptroller.address, utils.parseEther('1')).send();

    const againBoughtByOtherInvestor = comptroller
      .connect(secondInvestor)
      .buyShares.args(secondInvestor.address, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .value(buySharesArgs.amguValue)
      .send();

    await expect(againBoughtByOtherInvestor).resolves.toBeReceipt();
  });
});
