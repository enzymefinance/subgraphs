import { extractEvent, SignerWithAddress } from '@crestproject/crestproject';
import {
  callOnIntegrationArgs,
  ChaiAdapter,
  chaiLendArgs,
  CompoundAdapter,
  compoundArgs,
  ComptrollerLib,
  convertRateToScaledPerSecondRate,
  encodeArgs,
  feeManagerConfigArgs,
  FundDeployer,
  IntegrationManagerActionId,
  ISynthetixAddressResolver,
  ISynthetixDelegateApprovals,
  ISynthetixExchanger,
  KyberAdapter,
  kyberTakeOrderArgs,
  lendSelector,
  managementFeeConfigArgs,
  maxConcentrationArgs,
  performanceFeeConfigArgs,
  policyManagerConfigArgs,
  StandardToken,
  SynthetixAdapter,
  synthetixAssignExchangeDelegateSelector,
  synthetixTakeOrderArgs,
  takeOrderSelector,
  UniswapV2Adapter,
  uniswapV2LendArgs,
} from '@melonproject/protocol';
import { providers, utils, Wallet } from 'ethers';
import faker from 'faker';
import { createAccount, Deployment, fetchDeployment } from '../tests/utils/deployment';
import { Asset, fetchAssets } from '../tests/utils/subgraph-queries/fetchAssets';

(async () => {
  let deployment: Deployment;
  let assets: Asset[];
  let provider: providers.Provider;
  let manager: SignerWithAddress;
  let investor: SignerWithAddress;

  // const testnetEndpoint = 'http://localhost:4000/graphql';
  // const jsonRpcProvider = 'http://localhost:8545';
  // const subgraphApi = 'http://localhost:8000/subgraphs/name/melonproject/melon';

  const testnetEndpoint = 'https://testnet.avantgarde.finance/graphql';
  const jsonRpcProvider = 'https://testnet.avantgarde.finance';
  const subgraphApi = 'https://thegraph.testnet.avantgarde.finance/subgraphs/name/melonproject/melon';

  [deployment, assets] = await Promise.all([fetchDeployment(testnetEndpoint), fetchAssets(subgraphApi)]);
  provider = new providers.JsonRpcProvider(jsonRpcProvider);

  const tradeTokenSymbols = ['DAI', 'ZRX', 'KNC', 'BAT', 'ANT'];
  const uniswapV2PairUnderlyings = [
    ['DAI', 'WETH'],
    ['WETH', 'ZRX'],
    ['WETH', 'KNC'],
    ['BAT', 'WETH'],
    ['ANT', 'WETH'],
  ];
  const cTokenSymbols = ['cDAI', 'cZRX', '', 'cBAT', ''];

  const tokens = tradeTokenSymbols.map((symbol) => assets.find((asset) => asset.symbol === symbol)) as Asset[];
  const sUsd = assets.find((asset) => asset.symbol == 'sUSD') as Asset;

  const synthTokenSymbols = ['sBTC', 'iETH', 'iOIL', 'sFTSE', 'iDEFI'];
  const synthTokens = synthTokenSymbols.map((symbol) => assets.find((asset) => asset.symbol === symbol)) as Asset[];

  const uniswapV2Tokens0 = uniswapV2PairUnderlyings.map(([symbol0]) =>
    assets.find((asset) => asset.symbol === symbol0),
  ) as Asset[];
  const uniswapV2Tokens1 = uniswapV2PairUnderlyings.map(([_, symbol1]) =>
    assets.find((asset) => asset.symbol === symbol1),
  ) as Asset[];

  const cTokens = cTokenSymbols.map((symbol) => assets.find((asset) => asset.symbol === symbol));

  const [managerAddress, investorAddress] = await Promise.all([
    createAccount(testnetEndpoint),
    createAccount(testnetEndpoint),
  ]);

  manager = await SignerWithAddress.create(new Wallet(managerAddress.privateKey, provider));
  investor = await SignerWithAddress.create(new Wallet(investorAddress.privateKey, provider));

  const denominationAsset = new StandardToken(deployment.wethToken, provider);

  const kyberAdapter = new KyberAdapter(deployment.kyberAdapter, manager);
  const uniswapV2Adapter = new UniswapV2Adapter(deployment.uniswapV2Adapter, manager);
  const chaiAdapter = new ChaiAdapter(deployment.chaiAdapter, manager);
  const compoundAdapter = new CompoundAdapter(deployment.compoundAdapter, manager);

  const synthetixAddressResolver = new ISynthetixAddressResolver(deployment.synthetixAddressResolver, provider);
  const exchanger = await synthetixAddressResolver.requireAndGetAddress(
    utils.formatBytes32String('Exchanger'),
    `Missing Exchanger`,
  );
  const delegateApprovals = await synthetixAddressResolver.requireAndGetAddress(
    utils.formatBytes32String('DelegateApprovals'),
    `Missing DelegateApprovals`,
  );

  const synthetixExchanger = new ISynthetixExchanger(exchanger, manager);
  const synthetixDelegateApprovals = new ISynthetixDelegateApprovals(delegateApprovals, manager);
  const synthetixAdapter = new SynthetixAdapter(deployment.synthetixAdapter, manager);

  // create funds
  for (let i = 0; i < 100; i++) {
    console.log(`Creating fund #${i}`);
    const fundDeployer = new FundDeployer(deployment.fundDeployer, manager);

    // fees
    const managementFeeRate = utils.parseEther('0.01');
    const scaledPerSecondRate = convertRateToScaledPerSecondRate(managementFeeRate);

    const managementFeeSettings = managementFeeConfigArgs(scaledPerSecondRate);
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

    const name = faker.company.catchPhrase();

    const createNewFundTx = await fundDeployer
      .connect(manager)
      .createNewFund(
        manager,
        `${name} (${new Date().toLocaleTimeString()})`,
        denominationAsset,
        0,
        feeManagerConfig,
        policyManagerConfig,
      );

    const events = extractEvent(createNewFundTx, 'NewFundCreated');

    const comptrollerProxyAddress = events[0].args['comptrollerProxy'];
    const comptrollerProxy = new ComptrollerLib(comptrollerProxyAddress, manager);
    const vaultProxy = await comptrollerProxy.getVaultProxy();

    // buy shares
    console.log(`\tbuying shares`);

    const investmentAmount = utils.parseEther('10');
    const minSharesAmount = utils.parseEther('0.00000000001');

    await denominationAsset.connect(investor).approve(comptrollerProxy, investmentAmount);
    await comptrollerProxy.connect(investor).buyShares([investor], [investmentAmount], [minSharesAmount]);

    let remainder = i % tokens.length;

    // trade for token
    console.log(`\ttrading on Kyber`);

    const takeOrderArgs = kyberTakeOrderArgs({
      incomingAsset: tokens[remainder].id,
      minIncomingAssetAmount: utils.parseEther('0.000000001'),
      outgoingAsset: deployment.wethToken,
      outgoingAssetAmount: utils.parseEther('1'),
    });

    const callArgs = callOnIntegrationArgs({
      adapter: kyberAdapter,
      selector: takeOrderSelector,
      encodedCallArgs: takeOrderArgs,
    });

    await comptrollerProxy.callOnExtension(
      deployment.integrationManager,
      IntegrationManagerActionId.CallOnIntegration,
      callArgs,
    );

    // buy UniswapV2Pool
    console.log(`\tbuying uniswapV2Pool`);

    const uniswapV2Args = uniswapV2LendArgs({
      tokenA: uniswapV2Tokens0[remainder].id,
      tokenB: uniswapV2Tokens1[remainder].id,
      amountADesired: utils.parseEther('1'),
      amountBDesired: utils.parseEther('1'),
      amountAMin: utils.parseEther('1'),
      amountBMin: utils.parseEther('1'),
      minPoolTokenAmount: utils.parseEther('0.0001'),
    });

    const uniswapV2CallArgs = callOnIntegrationArgs({
      adapter: uniswapV2Adapter,
      selector: lendSelector,
      encodedCallArgs: uniswapV2Args,
    });

    await comptrollerProxy.callOnExtension(
      deployment.integrationManager,
      IntegrationManagerActionId.CallOnIntegration,
      uniswapV2CallArgs,
    );

    // chai lending
    console.log(`\tlending Chai`);

    if (remainder === 0) {
      const chaiArgs = chaiLendArgs({
        outgoingDaiAmount: utils.parseEther('1'),
        expectedIncomingChaiAmount: utils.parseEther('0.00000001'),
      });

      const chaiCallArgs = callOnIntegrationArgs({
        adapter: chaiAdapter,
        selector: lendSelector,
        encodedCallArgs: chaiArgs,
      });

      await comptrollerProxy.callOnExtension(
        deployment.integrationManager,
        IntegrationManagerActionId.CallOnIntegration,
        chaiCallArgs,
      );
    }

    // compound lending
    console.log(`\tlending Compound`);

    if (cTokens?.[remainder]?.id) {
      const lendArgs = await compoundArgs({
        cToken: (cTokens[remainder] as Asset).id,
        outgoingAssetAmount: utils.parseEther('1'),
        minIncomingAssetAmount: utils.parseEther('0.000000000001'),
      });

      const callArgs = callOnIntegrationArgs({
        adapter: compoundAdapter,
        selector: lendSelector,
        encodedCallArgs: lendArgs,
      });

      await comptrollerProxy.callOnExtension(
        deployment.integrationManager,
        IntegrationManagerActionId.CallOnIntegration,
        callArgs,
      );
    }

    // buy sUSD on Kyber
    console.log(`\tbuying sUSD on Kyber`);

    const takeSusdOrderArgs = kyberTakeOrderArgs({
      outgoingAsset: deployment.wethToken,
      outgoingAssetAmount: utils.parseEther('1'),
      incomingAsset: sUsd.id,
      minIncomingAssetAmount: utils.parseEther('0.000000001'),
    });

    const callSusdArgs = callOnIntegrationArgs({
      adapter: kyberAdapter,
      selector: takeOrderSelector,
      encodedCallArgs: takeSusdOrderArgs,
    });

    await comptrollerProxy.callOnExtension(
      deployment.integrationManager,
      IntegrationManagerActionId.CallOnIntegration,
      callSusdArgs,
    );

    // trade sUSD into another synth
    console.log(`\ttrading sUSD for another synth`);

    await comptrollerProxy.vaultCallOnContract(
      synthetixDelegateApprovals,
      synthetixAssignExchangeDelegateSelector,
      encodeArgs(['address'], [synthetixAdapter]),
    );

    const outgoingAssetAmount = utils.parseEther('1');
    const { 0: minIncomingAssetAmount } = await synthetixExchanger.getAmountsForExchange(
      outgoingAssetAmount,
      utils.formatBytes32String('sUSD'),
      utils.formatBytes32String(synthTokens[remainder].symbol),
    );

    const synthetixArgs = synthetixTakeOrderArgs({
      outgoingAsset: sUsd.id,
      outgoingAssetAmount,
      incomingAsset: synthTokens[remainder].id,
      minIncomingAssetAmount,
    });

    const synthetixCallArgs = callOnIntegrationArgs({
      adapter: synthetixAdapter,
      selector: takeOrderSelector,
      encodedCallArgs: synthetixArgs,
    });

    await comptrollerProxy.callOnExtension(
      deployment.integrationManager,
      IntegrationManagerActionId.CallOnIntegration,
      synthetixCallArgs,
    );

    console.log(`Created fund #${i}`);
  }
})();
