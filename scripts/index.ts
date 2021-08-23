import fs from 'fs';
import glob from 'glob';
import handlebars from 'handlebars';
import moment from 'moment';
import path from 'path';
import yargs from 'yargs';
import kovanA from './deployments/kovan-releaseA.json';
import kovanB from './deployments/kovan-releaseB.json';
import mainnetA from './deployments/mainnet-releaseA.json';
import mainnetB from './deployments/mainnet-releaseB.json';

interface Deployment {
  // Core
  dispatcher: string;

  // Release
  releases: Release[];

  // External
  wethToken: string;
  chaiIntegratee: string;
  kyberIntegratee: string;
  uniswapV2Integratee: string;
  synthetixIntegratee: string;
  synthetixAddressResolver: string;
  synthetixDelegateApprovals: string;

  // Currencies
  audChainlinkAggregator: string;
  btcChainlinkAggregator: string;
  chfChainlinkAggregator: string;
  eurChainlinkAggregator: string;
  gbpChainlinkAggregator: string;
  jpyChainlinkAggregator: string;
}

interface Release {
  id: string;
  networkName: string;
  startBlock: number;

  // core
  fundDeployer: string;
  vaultLib: string;
  comptrollerLib: string;
  valueInterpreter: string;
  integrationManager: string;
  policyManager: string;
  feeManager: string;

  // Prices
  aggregatedDerivativePriceFeed: string;
  chainlinkPriceFeed: string;

  // Derivative Price Feeds
  aavePriceFeed: string;
  alphaHomoraV1PriceFeed: string;
  chaiPriceFeed: string;
  compoundPriceFeed: string;
  curvePriceFeed: string;
  idlePriceFeed: string;
  lidoStethPriceFeed: string;
  stakehoundEthPriceFeed: string;
  synthetixPriceFeed: string;
  uniswapV2PoolPriceFeed: string;
  yearnVaultV2PriceFeed: string;
  wdgldPriceFeed: string;

  // Peripheral
  fundActionsWrapper: string;

  // Fees
  managementFee: string;
  performanceFee: string;
  entranceRateBurnFee: string;
  entranceRateDirectFee: string;

  // Policies
  adapterBlacklist: string;
  adapterWhitelist: string;
  assetBlacklist: string;
  assetWhitelist: string;
  investorWhitelist: string;
  guaranteedRedemption: string;
  maxConcentration: string;
  minMaxInvestment: string;
  buySharesCallerWhitelist: string;

  // Adapters
  aaveAdapter: string;
  alphaHomoraV1Adapter: string;
  chaiAdapter: string;
  compoundAdapter: string;
  curveExchangeAdapter: string;
  curveLiquidityAaveAdapter: string;
  curveLiquidityEursAdapter: string;
  curveLiquiditySethAdapter: string;
  curveLiquidityStethAdapter: string;
  idleAdapter: string;
  kyberAdapter: string;
  paraSwapAdapter: string;
  paraSwapV4Adapter: string;
  synthetixAdapter: string;
  trackedAssetsAdapter: string;
  uniswapV2Adapter: string;
  yearnVaultV2Adapter: string;
  zeroExV2Adapter: string;
}

interface DeploymentWithMetadata extends Deployment {
  networkName: string;
  startBlock: number;
}

async function fetchDeployment(source: string): Promise<DeploymentWithMetadata> {
  if (source === 'kovan') {
    return {
      networkName: 'kovan',
      startBlock: 24700000,

      // Core
      dispatcher: kovanA.contracts.Dispatcher.address,

      releases: [
        {
          id: 'A',
          networkName: 'kovan',
          startBlock: 24700000,
          fundDeployer: kovanA.contracts.FundDeployer.address,
          vaultLib: kovanA.contracts.VaultLib.address,
          comptrollerLib: kovanA.contracts.ComptrollerLib.address,
          valueInterpreter: kovanA.contracts.ValueInterpreter.address,
          integrationManager: kovanA.contracts.IntegrationManager.address,
          policyManager: kovanA.contracts.PolicyManager.address,
          feeManager: kovanA.contracts.FeeManager.address,

          // Prices
          aggregatedDerivativePriceFeed: kovanA.contracts.AggregatedDerivativePriceFeed.address,
          chainlinkPriceFeed: kovanA.contracts.ChainlinkPriceFeed.address,

          // Derivative Price Feeds
          aavePriceFeed: '0x0000000000000000000000000000000000000000',
          alphaHomoraV1PriceFeed: '0x0000000000000000000000000000000000000000',
          chaiPriceFeed: '0x0000000000000000000000000000000000000000',
          compoundPriceFeed: kovanA.contracts.CompoundPriceFeed.address,
          curvePriceFeed: '0x0000000000000000000000000000000000000000',
          idlePriceFeed: '0x0000000000000000000000000000000000000000',
          lidoStethPriceFeed: '0x0000000000000000000000000000000000000000',
          stakehoundEthPriceFeed: '0x0000000000000000000000000000000000000000',
          synthetixPriceFeed: kovanA.contracts.SynthetixPriceFeed.address,
          uniswapV2PoolPriceFeed: kovanA.contracts.UniswapV2PoolPriceFeed.address,
          wdgldPriceFeed: '0x0000000000000000000000000000000000000000',
          yearnVaultV2PriceFeed: '0x0000000000000000000000000000000000000000',

          // Peripheral
          fundActionsWrapper: kovanA.contracts.FundActionsWrapper.address,

          // Fees
          managementFee: kovanA.contracts.ManagementFee.address,
          performanceFee: kovanA.contracts.PerformanceFee.address,
          entranceRateBurnFee: kovanA.contracts.EntranceRateBurnFee.address,
          entranceRateDirectFee: kovanA.contracts.EntranceRateDirectFee.address,

          // Policies
          adapterBlacklist: kovanA.contracts.AdapterBlacklist.address,
          adapterWhitelist: kovanA.contracts.AdapterWhitelist.address,
          assetBlacklist: kovanA.contracts.AssetBlacklist.address,
          assetWhitelist: kovanA.contracts.AssetWhitelist.address,
          investorWhitelist: kovanA.contracts.InvestorWhitelist.address,
          guaranteedRedemption: kovanA.contracts.GuaranteedRedemption.address,
          maxConcentration: kovanA.contracts.MaxConcentration.address,
          minMaxInvestment: kovanA.contracts.MinMaxInvestment.address,
          buySharesCallerWhitelist: kovanA.contracts.BuySharesCallerWhitelist.address,

          // Adapters
          aaveAdapter: '0x0000000000000000000000000000000000000000',
          alphaHomoraV1Adapter: '0x0000000000000000000000000000000000000000',
          chaiAdapter: '0x0000000000000000000000000000000000000000',
          compoundAdapter: kovanA.contracts.CompoundAdapter.address,
          curveExchangeAdapter: '0x0000000000000000000000000000000000000000',
          curveLiquidityAaveAdapter: '0x0000000000000000000000000000000000000000',
          curveLiquidityEursAdapter: '0x0000000000000000000000000000000000000000',
          curveLiquiditySethAdapter: '0x0000000000000000000000000000000000000000',
          curveLiquidityStethAdapter: '0x0000000000000000000000000000000000000000',
          idleAdapter: '0x0000000000000000000000000000000000000000',
          kyberAdapter: kovanA.contracts.KyberAdapter.address,
          paraSwapAdapter: '0x0000000000000000000000000000000000000000',
          paraSwapV4Adapter: '0x0000000000000000000000000000000000000000',
          synthetixAdapter: kovanA.contracts.SynthetixAdapter.address,
          trackedAssetsAdapter: kovanA.contracts.TrackedAssetsAdapter.address,
          uniswapV2Adapter: kovanA.contracts.UniswapV2Adapter.address,
          yearnVaultV2Adapter: '0x0000000000000000000000000000000000000000',
          zeroExV2Adapter: kovanA.contracts.ZeroExV2Adapter.address,
        },
        {
          id: 'B',
          networkName: 'kovan',
          startBlock: 24700000,
          fundDeployer: kovanB.contracts.FundDeployer.address,
          vaultLib: kovanB.contracts.VaultLib.address,
          comptrollerLib: kovanB.contracts.ComptrollerLib.address,
          valueInterpreter: kovanB.contracts.ValueInterpreter.address,
          integrationManager: kovanB.contracts.IntegrationManager.address,
          policyManager: kovanB.contracts.PolicyManager.address,
          feeManager: kovanB.contracts.FeeManager.address,

          // Prices
          aggregatedDerivativePriceFeed: kovanB.contracts.AggregatedDerivativePriceFeed.address,
          chainlinkPriceFeed: kovanB.contracts.ChainlinkPriceFeed.address,

          // Derivative Price Feeds
          aavePriceFeed: '0x0000000000000000000000000000000000000000',
          alphaHomoraV1PriceFeed: '0x0000000000000000000000000000000000000000',
          chaiPriceFeed: '0x0000000000000000000000000000000000000000',
          compoundPriceFeed: kovanB.contracts.CompoundPriceFeed.address,
          curvePriceFeed: '0x0000000000000000000000000000000000000000',
          idlePriceFeed: '0x0000000000000000000000000000000000000000',
          lidoStethPriceFeed: '0x0000000000000000000000000000000000000000',
          stakehoundEthPriceFeed: '0x0000000000000000000000000000000000000000',
          synthetixPriceFeed: kovanB.contracts.SynthetixPriceFeed.address,
          uniswapV2PoolPriceFeed: kovanB.contracts.UniswapV2PoolPriceFeed.address,
          wdgldPriceFeed: '0x0000000000000000000000000000000000000000',
          yearnVaultV2PriceFeed: '0x0000000000000000000000000000000000000000',

          // Peripheral
          fundActionsWrapper: kovanB.contracts.FundActionsWrapper.address,

          // Fees
          managementFee: kovanB.contracts.ManagementFee.address,
          performanceFee: kovanB.contracts.PerformanceFee.address,
          entranceRateBurnFee: kovanB.contracts.EntranceRateBurnFee.address,
          entranceRateDirectFee: kovanB.contracts.EntranceRateDirectFee.address,

          // Policies
          adapterBlacklist: kovanB.contracts.AdapterBlacklist.address,
          adapterWhitelist: kovanB.contracts.AdapterWhitelist.address,
          assetBlacklist: kovanB.contracts.AssetBlacklist.address,
          assetWhitelist: kovanB.contracts.AssetWhitelist.address,
          investorWhitelist: kovanB.contracts.InvestorWhitelist.address,
          guaranteedRedemption: kovanB.contracts.GuaranteedRedemption.address,
          maxConcentration: kovanB.contracts.MaxConcentration.address,
          minMaxInvestment: kovanB.contracts.MinMaxInvestment.address,
          buySharesCallerWhitelist: kovanB.contracts.BuySharesCallerWhitelist.address,

          // Adapters
          aaveAdapter: '0x0000000000000000000000000000000000000000',
          alphaHomoraV1Adapter: '0x0000000000000000000000000000000000000000',
          chaiAdapter: '0x0000000000000000000000000000000000000000',
          compoundAdapter: kovanB.contracts.CompoundAdapter.address,
          curveExchangeAdapter: '0x0000000000000000000000000000000000000000',
          curveLiquidityAaveAdapter: '0x0000000000000000000000000000000000000000',
          curveLiquidityEursAdapter: '0x0000000000000000000000000000000000000000',
          curveLiquiditySethAdapter: '0x0000000000000000000000000000000000000000',
          curveLiquidityStethAdapter: '0x0000000000000000000000000000000000000000',
          idleAdapter: '0x0000000000000000000000000000000000000000',
          kyberAdapter: kovanB.contracts.KyberAdapter.address,
          paraSwapAdapter: '0x0000000000000000000000000000000000000000',
          paraSwapV4Adapter: '0x0000000000000000000000000000000000000000',
          synthetixAdapter: kovanB.contracts.SynthetixAdapter.address,
          trackedAssetsAdapter: kovanB.contracts.TrackedAssetsAdapter.address,
          uniswapV2Adapter: kovanB.contracts.UniswapV2Adapter.address,
          yearnVaultV2Adapter: '0x0000000000000000000000000000000000000000',
          zeroExV2Adapter: kovanB.contracts.ZeroExV2Adapter.address,
        },
      ],

      // External
      wethToken: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      // TODO: Expose all the external addresses under their right names.
      chaiIntegratee: '0x0000000000000000000000000000000000000000',
      kyberIntegratee: kovanA.contracts.Config.linkedData.kyber.networkProxy,
      uniswapV2Integratee: kovanA.contracts.Config.linkedData.uniswap.factory,
      synthetixIntegratee: kovanA.contracts.Config.linkedData.synthetix.addressResolver,
      synthetixAddressResolver: kovanA.contracts.Config.linkedData.synthetix.addressResolver,
      synthetixDelegateApprovals: kovanA.contracts.Config.linkedData.synthetix.delegateApprovals,

      // Currencies
      audChainlinkAggregator: '0x5813A90f826e16dB392abd2aF7966313fc1fd5B8',
      btcChainlinkAggregator: '0x6135b13325bfC4B00278B4abC5e20bbce2D6580e',
      chfChainlinkAggregator: '0xed0616BeF04D374969f302a34AE4A63882490A8C',
      eurChainlinkAggregator: '0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13',
      gbpChainlinkAggregator: '0x28b0061f44E6A9780224AA61BEc8C3Fcb0d37de9',
      jpyChainlinkAggregator: '0xD627B1eF3AC23F1d3e576FA6206126F3c1Bd0942',
    };
  }

  if (source === 'mainnet') {
    return {
      networkName: 'mainnet',
      startBlock: 11636493,

      // Core
      dispatcher: mainnetA.contracts.Dispatcher.address,

      releases: [
        {
          // A is FundDeployer 0x9134c9975244b46692ad9a7da36dba8734ec6da3 - Jan-11-2021 11:00:42 PM +UTC
          id: 'A',
          networkName: 'mainnet',
          startBlock: 11636493,
          fundDeployer: mainnetA.contracts.FundDeployer.address,
          vaultLib: mainnetA.contracts.VaultLib.address,
          comptrollerLib: mainnetA.contracts.ComptrollerLib.address,
          valueInterpreter: mainnetA.contracts.ValueInterpreter.address,
          integrationManager: mainnetA.contracts.IntegrationManager.address,
          policyManager: mainnetA.contracts.PolicyManager.address,
          feeManager: mainnetA.contracts.FeeManager.address,

          // Prices
          aggregatedDerivativePriceFeed: mainnetA.contracts.AggregatedDerivativePriceFeed.address,
          chainlinkPriceFeed: mainnetA.contracts.ChainlinkPriceFeed.address,

          // Derivative Price Feeds
          aavePriceFeed: mainnetA.contracts.AavePriceFeed.address,
          alphaHomoraV1PriceFeed: mainnetA.contracts.AlphaHomoraV1PriceFeed.address,
          chaiPriceFeed: mainnetA.contracts.ChaiPriceFeed.address,
          compoundPriceFeed: mainnetA.contracts.CompoundPriceFeed.address,
          curvePriceFeed: mainnetA.contracts.CurvePriceFeed.address,
          idlePriceFeed: mainnetA.contracts.IdlePriceFeed.address,
          lidoStethPriceFeed: mainnetA.contracts.LidoStethPriceFeed.address,
          stakehoundEthPriceFeed: mainnetA.contracts.StakehoundEthPriceFeed.address,
          synthetixPriceFeed: mainnetA.contracts.SynthetixPriceFeed.address,
          uniswapV2PoolPriceFeed: mainnetA.contracts.UniswapV2PoolPriceFeed.address,
          wdgldPriceFeed: mainnetA.contracts.WdgldPriceFeed.address,
          yearnVaultV2PriceFeed: '0x0000000000000000000000000000000000000000',

          // Peripheral
          fundActionsWrapper: mainnetA.contracts.FundActionsWrapper.address,

          // Fees
          managementFee: mainnetA.contracts.ManagementFee.address,
          performanceFee: mainnetA.contracts.PerformanceFee.address,
          entranceRateBurnFee: mainnetA.contracts.EntranceRateBurnFee.address,
          entranceRateDirectFee: mainnetA.contracts.EntranceRateDirectFee.address,

          // Policies
          adapterBlacklist: mainnetA.contracts.AdapterBlacklist.address,
          adapterWhitelist: mainnetA.contracts.AdapterWhitelist.address,
          assetBlacklist: mainnetA.contracts.AssetBlacklist.address,
          assetWhitelist: mainnetA.contracts.AssetWhitelist.address,
          investorWhitelist: mainnetA.contracts.InvestorWhitelist.address,
          guaranteedRedemption: mainnetA.contracts.GuaranteedRedemption.address,
          maxConcentration: mainnetA.contracts.MaxConcentration.address,
          minMaxInvestment: mainnetA.contracts.MinMaxInvestment.address,
          buySharesCallerWhitelist: mainnetA.contracts.BuySharesCallerWhitelist.address,

          // Adapters
          aaveAdapter: mainnetA.contracts.AaveAdapter.address,
          alphaHomoraV1Adapter: mainnetA.contracts.AlphaHomoraV1Adapter.address,
          curveExchangeAdapter: mainnetA.contracts.CurveExchangeAdapter.address,
          curveLiquidityAaveAdapter: mainnetA.contracts.CurveLiquidityAaveAdapter.address,
          curveLiquidityEursAdapter: '0x0000000000000000000000000000000000000000',
          curveLiquiditySethAdapter: mainnetA.contracts.CurveLiquiditySethAdapter.address,
          curveLiquidityStethAdapter: mainnetA.contracts.CurveLiquidityStethAdapter.address,
          trackedAssetsAdapter: mainnetA.contracts.TrackedAssetsAdapter.address,
          compoundAdapter: mainnetA.contracts.CompoundAdapter.address,
          chaiAdapter: mainnetA.contracts.ChaiAdapter.address,
          idleAdapter: mainnetA.contracts.IdleAdapter.address,
          kyberAdapter: mainnetA.contracts.KyberAdapter.address,
          paraSwapAdapter: mainnetA.contracts.ParaSwapAdapter.address,
          paraSwapV4Adapter: mainnetA.contracts.ParaSwapV4Adapter.address,
          synthetixAdapter: mainnetA.contracts.SynthetixAdapter.address,
          uniswapV2Adapter: mainnetA.contracts.UniswapV2Adapter.address,
          yearnVaultV2Adapter: '0x0000000000000000000000000000000000000000',
          zeroExV2Adapter: mainnetA.contracts.ZeroExV2Adapter.address,
        },
        // B is FundDeployer xxxx -
        {
          id: 'B',
          networkName: 'mainnet',
          startBlock: 12387773,
          fundDeployer: mainnetB.contracts.FundDeployer.address,
          vaultLib: mainnetB.contracts.VaultLib.address,
          comptrollerLib: mainnetB.contracts.ComptrollerLib.address,
          valueInterpreter: mainnetB.contracts.ValueInterpreter.address,
          integrationManager: mainnetB.contracts.IntegrationManager.address,
          policyManager: mainnetB.contracts.PolicyManager.address,
          feeManager: mainnetB.contracts.FeeManager.address,

          // Prices
          aggregatedDerivativePriceFeed: mainnetB.contracts.AggregatedDerivativePriceFeed.address,
          chainlinkPriceFeed: mainnetB.contracts.ChainlinkPriceFeed.address,

          // Derivative Price Feeds
          aavePriceFeed: mainnetB.contracts.AavePriceFeed.address,
          alphaHomoraV1PriceFeed: mainnetB.contracts.AlphaHomoraV1PriceFeed.address,
          chaiPriceFeed: '0x0000000000000000000000000000000000000000',
          compoundPriceFeed: mainnetB.contracts.CompoundPriceFeed.address,
          curvePriceFeed: mainnetB.contracts.CurvePriceFeed.address,
          idlePriceFeed: mainnetB.contracts.IdlePriceFeed.address,
          lidoStethPriceFeed: mainnetB.contracts.LidoStethPriceFeed.address,
          stakehoundEthPriceFeed: mainnetB.contracts.StakehoundEthPriceFeed.address,
          synthetixPriceFeed: mainnetB.contracts.SynthetixPriceFeed.address,
          uniswapV2PoolPriceFeed: mainnetB.contracts.UniswapV2PoolPriceFeed.address,
          wdgldPriceFeed: mainnetB.contracts.WdgldPriceFeed.address,
          yearnVaultV2PriceFeed: mainnetB.contracts.YearnVaultV2PriceFeed.address,

          // Peripheral
          fundActionsWrapper: mainnetB.contracts.FundActionsWrapper.address,

          // Fees
          managementFee: mainnetB.contracts.ManagementFee.address,
          performanceFee: mainnetB.contracts.PerformanceFee.address,
          entranceRateBurnFee: mainnetB.contracts.EntranceRateBurnFee.address,
          entranceRateDirectFee: mainnetB.contracts.EntranceRateDirectFee.address,

          // Policies
          adapterBlacklist: mainnetB.contracts.AdapterBlacklist.address,
          adapterWhitelist: mainnetB.contracts.AdapterWhitelist.address,
          assetBlacklist: mainnetB.contracts.AssetBlacklist.address,
          assetWhitelist: mainnetB.contracts.AssetWhitelist.address,
          investorWhitelist: mainnetB.contracts.InvestorWhitelist.address,
          guaranteedRedemption: mainnetB.contracts.GuaranteedRedemption.address,
          maxConcentration: mainnetB.contracts.MaxConcentration.address,
          minMaxInvestment: mainnetB.contracts.MinMaxInvestment.address,
          buySharesCallerWhitelist: mainnetB.contracts.BuySharesCallerWhitelist.address,

          // Adapters
          aaveAdapter: mainnetB.contracts.AaveAdapter.address,
          alphaHomoraV1Adapter: mainnetB.contracts.AlphaHomoraV1Adapter.address,
          curveExchangeAdapter: mainnetB.contracts.CurveExchangeAdapter.address,
          curveLiquidityAaveAdapter: mainnetB.contracts.CurveLiquidityAaveAdapter.address,
          curveLiquidityEursAdapter: mainnetB.contracts.CurveLiquidityEursAdapter.address,
          curveLiquiditySethAdapter: mainnetB.contracts.CurveLiquiditySethAdapter.address,
          curveLiquidityStethAdapter: mainnetB.contracts.CurveLiquidityStethAdapter.address,
          trackedAssetsAdapter: mainnetB.contracts.TrackedAssetsAdapter.address,
          compoundAdapter: mainnetB.contracts.CompoundAdapter.address,
          chaiAdapter: '0x0000000000000000000000000000000000000000',
          idleAdapter: mainnetB.contracts.IdleAdapter.address,
          kyberAdapter: mainnetB.contracts.KyberAdapter.address,
          paraSwapAdapter: '0x0000000000000000000000000000000000000000',
          paraSwapV4Adapter: mainnetB.contracts.ParaSwapV4Adapter.address,
          synthetixAdapter: mainnetB.contracts.SynthetixAdapter.address,
          uniswapV2Adapter: mainnetB.contracts.UniswapV2Adapter.address,
          yearnVaultV2Adapter: mainnetB.contracts.YearnVaultV2Adapter.address,
          zeroExV2Adapter: mainnetB.contracts.ZeroExV2Adapter.address,
        },
      ],

      // External
      wethToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      // TODO: Expose all the external addresses under their right names.
      chaiIntegratee: mainnetA.contracts['Config'].linkedData.chai.chai,
      kyberIntegratee: mainnetA.contracts['Config'].linkedData.kyber.networkProxy,
      uniswapV2Integratee: mainnetA.contracts['Config'].linkedData.uniswap.router,
      synthetixIntegratee: mainnetA.contracts['Config'].linkedData.synthetix.snx,
      synthetixAddressResolver: mainnetA.contracts['Config'].linkedData.synthetix.addressResolver,
      synthetixDelegateApprovals: mainnetA.contracts['Config'].linkedData.synthetix.delegateApprovals,

      // Currencies
      audChainlinkAggregator: '0x77F9710E7d0A19669A13c055F62cd80d313dF022',
      btcChainlinkAggregator: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
      chfChainlinkAggregator: '0x449d117117838fFA61263B61dA6301AA2a88B13A',
      eurChainlinkAggregator: '0xb49f677943BC038e9857d61E7d053CaA2C1734C1',
      gbpChainlinkAggregator: '0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5',
      jpyChainlinkAggregator: '0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3',
    };
  }

  throw new Error('Unsupported deployment');
}

yargs
  .command('flatten', 'Flatten the generated code.', () => {
    const generated = path.resolve(__dirname, '..', 'src', 'generated');
    const globbed = glob.sync('**/*', { cwd: path.join(generated), absolute: true });
    const files = globbed.filter((item) => {
      const stats = fs.statSync(item);
      return stats.isFile();
    });

    const directories = globbed.filter((item) => {
      const stats = fs.statSync(item);
      return stats.isDirectory();
    });

    files.forEach((item) => {
      const to = path.join(generated, path.basename(item));
      fs.renameSync(item, to);
    });

    directories.forEach((item) => {
      fs.rmSync(item, { recursive: true, force: true });
    });
  })
  .command(
    'template',
    'Generate files from templates using the deployment addresses.',
    (yargs) => {
      return yargs.option('deployment', {
        type: 'string',
        default: 'mainnet',
      });
    },
    async (args) => {
      const deploymentJson = await fetchDeployment(args.deployment);

      {
        console.log('Generating subgraph manifest');

        const templateFile = path.join(__dirname, '../templates/subgraph.yml');
        const outputFile = path.join(__dirname, '../subgraph.yaml');
        const templateContent = fs.readFileSync(templateFile, 'utf8');

        const compile = handlebars.compile(templateContent);
        const replaced = compile(deploymentJson);

        fs.writeFileSync(outputFile, replaced);
      }

      {
        console.log('Generating static address map');

        const templateFile = path.join(__dirname, '../templates/addresses.ts');
        const outputFile = path.join(__dirname, '../src/addresses.ts');
        const templateContent = fs.readFileSync(templateFile, 'utf8');

        const compile = handlebars.compile(templateContent);
        const replaced = compile(deploymentJson);

        fs.writeFileSync(outputFile, replaced);
      }

      {
        console.log('Generating timestamps for month starts');

        const initial = moment.utc('2020-11-01T00:00:00.000Z').startOf('month').startOf('day');
        const timestamps = Array(100)
          .fill(null)
          .map((_, index) => initial.clone().add(index, 'month').startOf('month').startOf('day'));

        const data = {
          months: timestamps.map((timestamp) => ({ start: timestamp.unix() })),
        };

        const templateFile = path.join(__dirname, '../templates/months.ts');
        const outpufile = path.join(__dirname, '../src/months.ts');
        const templateContent = fs.readFileSync(templateFile, 'utf8');

        const compile = handlebars.compile(templateContent);
        const replaced = compile(data);

        fs.writeFileSync(outpufile, replaced);
      }
    },
  )
  .help().argv;
