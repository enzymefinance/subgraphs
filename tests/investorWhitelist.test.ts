import { randomAddress } from '@crestproject/crestproject';
import {
  ComptrollerLib,
  Dispatcher,
  encodeArgs,
  FundDeployer,
  PolicyManager,
  StandardToken,
} from '@melonproject/protocol';
import { assertEvent } from '@melonproject/testutils';
import { BigNumber, providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';
import { waitForSubgraph } from './utils/subgraph';
import { fetchFund } from './utils/subgraph-queries/fetchFund';
import { fetchInvestment } from './utils/subgraph-queries/fetchInvestment';

describe('Walkthrough', () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let signer: Wallet;
  let investor: Wallet;
  let otherInvestor: Wallet;

  const testnetEndpoint = 'http://localhost:4000/graphql';
  const jsonRpcProvider = 'http://localhost:8545';
  const subgraphStatusEndpoint = 'http://localhost:8030/graphql';
  const subgraphApi = 'http://localhost:8000/subgraphs/name/melonproject/melon';

  beforeAll(async () => {
    const account = await createAccount(testnetEndpoint);
    deployment = await fetchDeployment(testnetEndpoint);
    provider = new providers.JsonRpcProvider(jsonRpcProvider);
    signer = new Wallet(account.privateKey, provider);

    const investorAccount = await createAccount(testnetEndpoint);
    investor = new Wallet(investorAccount.privateKey, provider);

    const otherInvestorAccount = await createAccount(testnetEndpoint);
    otherInvestor = new Wallet(otherInvestorAccount.privateKey, provider);
  });

  it("should walkthrough a fund's lifecycle", async () => {
    const dispatcher = new Dispatcher(deployment.dispatcher, provider);
    const fundDeployerAddress = await dispatcher.getCurrentFundDeployer();
    const fundDeployer = new FundDeployer(fundDeployerAddress, provider);
    const denominationAsset = new StandardToken(deployment.wethToken, provider);

    // create fund with fees

    const managementFeeSettings = encodeArgs(['uint256'], [BigNumber.from('100000000000000000')]);

    const performanceFeeSettings = encodeArgs(
      ['uint256', 'uint256'],
      [BigNumber.from('100000000000000000'), BigNumber.from('1000000')],
    );

    const fees = [deployment.managementFee, deployment.performanceFee];
    const feesSettingsData = [managementFeeSettings, performanceFeeSettings];

    const feeManagerConfigData = encodeArgs(['address[]', 'bytes[]'], [fees, feesSettingsData]);

    // create fund
    const newFundArgs = {
      fundOwner: signer.address,
      fundName: 'My Super Fund',
      denominationAsset,
      sharesActionTimelock: 0,
      allowedBuySharesCallers: [],
      feeManagerConfigData,
      policyManagerConfigData: '0x',
    };

    const createFundTx = await fundDeployer
      .connect(signer)
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
      feeManagerConfigData: utils.hexlify(feeManagerConfigData),
      policyManagerConfigData: utils.hexlify('0x'),
    });

    await waitForSubgraph(subgraphStatusEndpoint, createFundTx.blockNumber);
    const subgraphFund = await fetchFund(subgraphApi, vaultProxy.toLowerCase(), createFundTx.blockNumber);

    expect(subgraphFund.name).toBe(newFundArgs.fundName);
    const comptroller = new ComptrollerLib(comptrollerProxy, signer);
    const policyManager = new PolicyManager(deployment.policyManager, signer);

    // enable investor whitelist policy
    const investorWhitelist = deployment.investorWhitelist;
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

    const enabled = await policyManager.enablePolicyForFund
      .args(comptrollerProxy, investorWhitelist, investorWhitelistSettings)
      .send(false);

    await expect(enabled.wait()).resolves.toBeReceipt();

    // buy shares (investor on whitelist)
    const approveAmount = 10;
    const sharesToBuy = 1;
    const buySharesArgs = {
      investmentAmount: utils.parseEther(sharesToBuy.toString()),
      amguValue: utils.parseEther('1'),
      minSharesAmount: utils.parseEther(sharesToBuy.toString()),
    };

    await denominationAsset
      .connect(investor)
      .approve.args(comptrollerProxy, utils.parseEther(approveAmount.toString()))
      .send();

    const bought = await comptroller
      .connect(investor)
      .buyShares.args(investor.address, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .value(buySharesArgs.amguValue)
      .send();

    expect(bought).toBeReceipt();

    await waitForSubgraph(subgraphStatusEndpoint, bought.blockNumber);
    const investmentId = `${vaultProxy.toLowerCase()}/${investor.address.toLowerCase()}`;
    const subgraphInvestment = await fetchInvestment(subgraphApi, investmentId, bought.blockNumber);
    expect(subgraphInvestment.shares).toEqual(sharesToBuy.toString());
    expect(subgraphInvestment.investor.investor).toBe(true);

    // buy shares (other investor, not on whitelist)
    await denominationAsset
      .connect(otherInvestor)
      .approve.args(comptrollerProxy, utils.parseEther(approveAmount.toString()))
      .send();

    const boughtByOtherInvestor = comptroller
      .connect(otherInvestor)
      .buyShares.args(otherInvestor.address, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .value(buySharesArgs.amguValue)
      .send();

    expect(boughtByOtherInvestor).rejects.toBeRevertedWith('Rule evaluated to false: INVESTOR_WHITELIST');

    // disable policy
    const disabled = policyManager.disablePolicyForFund.args(comptrollerProxy, investorWhitelist).send();

    await expect(disabled).resolves.toBeReceipt();

    // buy shares (other investor, not on whitelist, should now work)
    await denominationAsset
      .connect(otherInvestor)
      .approve.args(comptrollerProxy, utils.parseEther(approveAmount.toString()))
      .send();

    const againBoughtByOtherInvestor = comptroller
      .connect(otherInvestor)
      .buyShares.args(otherInvestor.address, buySharesArgs.investmentAmount, buySharesArgs.minSharesAmount)
      .value(buySharesArgs.amguValue)
      .send();

    await expect(againBoughtByOtherInvestor).resolves.toBeReceipt();
  });
});
