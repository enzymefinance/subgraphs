import { extractEvent, SignerWithAddress } from '@crestproject/crestproject';
import {
  addTrackedAssetsArgs,
  addTrackedAssetsSelector,
  callOnIntegrationArgs,
  ChaiAdapter,
  chaiLendArgs,
  chaiRedeemArgs,
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
  MockToken,
  MockUniswapV2PriceSource,
  performanceFeeConfigArgs,
  policyManagerConfigArgs,
  redeemSelector,
  StandardToken,
  SynthetixAdapter,
  synthetixAssignExchangeDelegateSelector,
  synthetixTakeOrderArgs,
  takeOrderSelector,
  TrackedAssetsAdapter,
  UniswapV2Adapter,
  uniswapV2LendArgs,
  uniswapV2RedeemArgs,
  uniswapV2TakeOrderArgs,
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

  const uniswapV2Pairs = uniswapV2PairUnderlyings.map(([symbol0, symbol1]) =>
    assets.find(
      (asset) =>
        asset.uniswapV2PoolAssetDetail?.token0.symbol === symbol0 &&
        asset.uniswapV2PoolAssetDetail?.token1.symbol === symbol1,
    ),
  ) as Asset[];

  const cTokens = cTokenSymbols.map((symbol) => assets.find((asset) => asset.symbol === symbol));

  const chaiToken = assets.find((asset) => asset.symbol == 'CHAI') as Asset;

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

  const addTrackedAssetsAdapter = new TrackedAssetsAdapter(deployment.trackedAssetsAdapter, manager);

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

    // trade for token
    console.log(`\ttrading on Uniswap`);

    const takeOrderUniswapArgs = uniswapV2TakeOrderArgs({
      path: [deployment.wethToken, tokens[remainder].id],
      outgoingAssetAmount: utils.parseEther('1'),
      minIncomingAssetAmount: utils.parseEther('0.000000001'),
    });

    const callUniswapTakeOrderArgs = callOnIntegrationArgs({
      adapter: uniswapV2Adapter,
      selector: takeOrderSelector,
      encodedCallArgs: takeOrderUniswapArgs,
    });

    await comptrollerProxy.callOnExtension(
      deployment.integrationManager,
      IntegrationManagerActionId.CallOnIntegration,
      callUniswapTakeOrderArgs,
    );

    // buy UniswapV2Pool
    console.log(`\tbuying uniswapV2Pool`);

    const token0 = new MockToken(uniswapV2Tokens0[remainder].id, manager);
    const token1 = new MockToken(uniswapV2Tokens1[remainder].id, manager);
    const decimals0 = await token0.decimals();
    const decimals1 = await token1.decimals();

    const uniswapV2Args = uniswapV2LendArgs({
      tokenA: uniswapV2Tokens0[remainder].id,
      tokenB: uniswapV2Tokens1[remainder].id,
      amountADesired: utils.parseUnits('0.000001', decimals0),
      amountBDesired: utils.parseUnits('0.000001', decimals1),
      amountAMin: 1,
      amountBMin: 1,
      minPoolTokenAmount: 1,
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

    // sell UniswapV2Pool
    console.log(`\tselling uniswapV2Pool`);

    const pair = new MockUniswapV2PriceSource(uniswapV2Pairs[remainder].id, manager);
    const balance = await pair.balanceOf(vaultProxy);

    const usV2RedeemArgs = uniswapV2RedeemArgs({
      poolTokenAmount: balance.div(2),
      tokenA: uniswapV2Tokens0[remainder].id,
      tokenB: uniswapV2Tokens1[remainder].id,
      amountAMin: 1,
      amountBMin: 1,
    });

    const usV2RedeemCallArgs = callOnIntegrationArgs({
      adapter: uniswapV2Adapter,
      selector: redeemSelector,
      encodedCallArgs: usV2RedeemArgs,
    });

    await comptrollerProxy.callOnExtension(
      deployment.integrationManager,
      IntegrationManagerActionId.CallOnIntegration,
      usV2RedeemCallArgs,
    );

    // chai lending
    console.log(`\tlending Chai`);

    if (remainder === 0) {
      const chaiLArgs = chaiLendArgs({
        outgoingDaiAmount: utils.parseEther('1'),
        expectedIncomingChaiAmount: utils.parseEther('0.00000001'),
      });

      const chaiLCallArgs = callOnIntegrationArgs({
        adapter: chaiAdapter,
        selector: lendSelector,
        encodedCallArgs: chaiLArgs,
      });

      await comptrollerProxy.callOnExtension(
        deployment.integrationManager,
        IntegrationManagerActionId.CallOnIntegration,
        chaiLCallArgs,
      );

      // chai redemption
      console.log(`\tredeeming Chai`);

      const chai = new StandardToken(chaiToken.id, manager);
      const chaiBalance = await chai.balanceOf(vaultProxy);

      const chaiRArgs = chaiRedeemArgs({
        outgoingChaiAmount: chaiBalance.div(2),
        expectedIncomingDaiAmount: 1,
      });

      const chaiRCallArgs = callOnIntegrationArgs({
        adapter: chaiAdapter,
        selector: redeemSelector,
        encodedCallArgs: chaiRArgs,
      });

      await comptrollerProxy.callOnExtension(
        deployment.integrationManager,
        IntegrationManagerActionId.CallOnIntegration,
        chaiRCallArgs,
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

      // compound redeeming
      // console.log(`\tredeeming Compound`);

      // const cToken = new StandardToken((cTokens[remainder] as Asset).id, manager);

      // const cTokenBalance = await cToken.balanceOf(vaultProxy);

      // const redeemArgs = await compoundArgs({
      //   cToken: (cTokens[remainder] as Asset).id,
      //   outgoingAssetAmount: cTokenBalance.div(10),
      //   minIncomingAssetAmount: 1,
      // });

      // const callCompoundArgs = callOnIntegrationArgs({
      //   adapter: compoundAdapter,
      //   selector: redeemSelector,
      //   encodedCallArgs: redeemArgs,
      // });

      // await comptrollerProxy.callOnExtension(
      //   deployment.integrationManager,
      //   IntegrationManagerActionId.CallOnIntegration,
      //   callCompoundArgs,
      // );
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

    // transfer assets to vault, and call tracked assets
    console.log(`\tadding tracked assets`);

    const uni = assets.find((asset) => asset.symbol === 'UNI') as Asset;
    const uniToken = new MockToken(uni.id, manager);

    const yfi = assets.find((asset) => asset.symbol === 'YFI') as Asset;
    const yfiToken = new MockToken(yfi.id, manager);

    await uniToken.mintFor(vaultProxy, utils.parseEther('2'));
    await yfiToken.mintFor(vaultProxy, utils.parseEther('2'));

    const trackedAssetsArgs = addTrackedAssetsArgs([uniToken, yfiToken]);

    const trackedAssetsCallArgs = callOnIntegrationArgs({
      adapter: addTrackedAssetsAdapter,
      selector: addTrackedAssetsSelector,
      encodedCallArgs: trackedAssetsArgs,
    });

    await comptrollerProxy.callOnExtension(
      deployment.integrationManager,
      IntegrationManagerActionId.CallOnIntegration,
      trackedAssetsCallArgs,
    );

    console.log(`Created fund #${i}`);
  }
})();
