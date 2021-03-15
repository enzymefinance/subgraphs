import fs from 'fs';
import glob from 'glob';
import handlebars from 'handlebars';
import moment from 'moment';
import path from 'path';
import yargs from 'yargs';
import kovan from './deployments/kovan.json';
import mainnet from './deployments/mainnet.json';

interface Deployment {
  // Core
  dispatcher: string;
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
  lidoStethPriceFeed: string;
  stakehoundEthPriceFeed: string;
  synthetixPriceFeed: string;
  uniswapV2PoolPriceFeed: string;
  wdgldPriceFeed: string;

  // Peripheral
  fundActionsWrapper: string;
  authUserExecutedSharesRequestorFactory: string;

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
  trackedAssetsAdapter: string;
  compoundAdapter: string;
  chaiAdapter: string;
  kyberAdapter: string;
  uniswapV2Adapter: string;
  paraSwapAdapter: string;
  zeroExV2Adapter: string;
  synthetixAdapter: string;
  alphaHomoraV1Adapter: string;
  aaveAdapter: string;

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

interface DeploymentWithMetadata extends Deployment {
  networkName: string;
  startBlock: number;
}

async function fetchDeployment(source: string): Promise<DeploymentWithMetadata> {
  if (source === 'kovan') {
    return {
      networkName: 'kovan',
      startBlock: 22906438,

      // Core
      dispatcher: kovan.contracts.Dispatcher.address,
      fundDeployer: kovan.contracts.FundDeployer.address,
      vaultLib: kovan.contracts.VaultLib.address,
      comptrollerLib: kovan.contracts.ComptrollerLib.address,
      valueInterpreter: kovan.contracts.ValueInterpreter.address,
      integrationManager: kovan.contracts.IntegrationManager.address,
      policyManager: kovan.contracts.PolicyManager.address,
      feeManager: kovan.contracts.FeeManager.address,

      // Prices
      aggregatedDerivativePriceFeed: kovan.contracts.AggregatedDerivativePriceFeed.address,
      chainlinkPriceFeed: kovan.contracts.ChainlinkPriceFeed.address,

      // Derivative Price Feeds
      aavePriceFeed: '0x0000000000000000000000000000000000000000',
      alphaHomoraV1PriceFeed: '0x0000000000000000000000000000000000000000',
      chaiPriceFeed: kovan.contracts.ChaiPriceFeed.address,
      compoundPriceFeed: kovan.contracts.CompoundPriceFeed.address,
      curvePriceFeed: '0x0000000000000000000000000000000000000000',
      lidoStethPriceFeed: '0x0000000000000000000000000000000000000000',
      stakehoundEthPriceFeed: '0x0000000000000000000000000000000000000000',
      synthetixPriceFeed: kovan.contracts.SynthetixPriceFeed.address,
      uniswapV2PoolPriceFeed: kovan.contracts.UniswapV2PoolPriceFeed.address,
      wdgldPriceFeed: kovan.contracts.WdgldPriceFeed.address,

      // Peripheral
      fundActionsWrapper: kovan.contracts.FundActionsWrapper.address,
      authUserExecutedSharesRequestorFactory: kovan.contracts.AuthUserExecutedSharesRequestorFactory.address,

      // Fees
      managementFee: kovan.contracts.ManagementFee.address,
      performanceFee: kovan.contracts.PerformanceFee.address,
      entranceRateBurnFee: kovan.contracts.EntranceRateBurnFee.address,
      entranceRateDirectFee: kovan.contracts.EntranceRateDirectFee.address,

      // Policies
      adapterBlacklist: kovan.contracts.AdapterBlacklist.address,
      adapterWhitelist: kovan.contracts.AdapterWhitelist.address,
      assetBlacklist: kovan.contracts.AssetBlacklist.address,
      assetWhitelist: kovan.contracts.AssetWhitelist.address,
      investorWhitelist: kovan.contracts.InvestorWhitelist.address,
      guaranteedRedemption: kovan.contracts.GuaranteedRedemption.address,
      maxConcentration: kovan.contracts.MaxConcentration.address,
      minMaxInvestment: kovan.contracts.MinMaxInvestment.address,
      buySharesCallerWhitelist: kovan.contracts.BuySharesCallerWhitelist.address,

      // Adapters
      trackedAssetsAdapter: kovan.contracts.TrackedAssetsAdapter.address,
      compoundAdapter: kovan.contracts.CompoundAdapter.address,
      chaiAdapter: kovan.contracts.ChaiAdapter.address,
      kyberAdapter: kovan.contracts.KyberAdapter.address,
      uniswapV2Adapter: kovan.contracts.UniswapV2Adapter.address,
      paraSwapAdapter: kovan.contracts.ParaSwapAdapter.address,
      zeroExV2Adapter: kovan.contracts.ZeroExV2Adapter.address,
      synthetixAdapter: kovan.contracts.SynthetixAdapter.address,
      alphaHomoraV1Adapter: '0x0000000000000000000000000000000000000000',
      aaveAdapter: '0x0000000000000000000000000000000000000000',

      // External
      wethToken: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      // TODO: Expose all the external addresses under their right names.
      chaiIntegratee: kovan.contracts['mocks/MockChaiIntegratee'].address,
      kyberIntegratee: kovan.contracts['mocks/MockKyberIntegratee'].address,
      uniswapV2Integratee: kovan.contracts['mocks/MockUniswapV2Integratee'].address,
      synthetixIntegratee: kovan.contracts['mocks/MockSynthetixIntegratee'].address,
      synthetixAddressResolver: kovan.contracts['mocks/MockSynthetixIntegratee'].address,
      synthetixDelegateApprovals: kovan.contracts['mocks/MockSynthetixIntegratee'].address,

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
      dispatcher: mainnet.contracts.Dispatcher.address,
      fundDeployer: mainnet.contracts.FundDeployer.address,
      vaultLib: mainnet.contracts.VaultLib.address,
      comptrollerLib: mainnet.contracts.ComptrollerLib.address,
      valueInterpreter: mainnet.contracts.ValueInterpreter.address,
      integrationManager: mainnet.contracts.IntegrationManager.address,
      policyManager: mainnet.contracts.PolicyManager.address,
      feeManager: mainnet.contracts.FeeManager.address,

      // Prices
      aggregatedDerivativePriceFeed: mainnet.contracts.AggregatedDerivativePriceFeed.address,
      chainlinkPriceFeed: mainnet.contracts.ChainlinkPriceFeed.address,

      // Derivative Price Feeds
      aavePriceFeed: '0x0000000000000000000000000000000000000000',
      alphaHomoraV1PriceFeed: mainnet.contracts.AlphaHomoraV1PriceFeed.address,
      chaiPriceFeed: mainnet.contracts.ChaiPriceFeed.address,
      compoundPriceFeed: mainnet.contracts.CompoundPriceFeed.address,
      curvePriceFeed: '0x0000000000000000000000000000000000000000',
      lidoStethPriceFeed: '0x0000000000000000000000000000000000000000',
      stakehoundEthPriceFeed: mainnet.contracts.StakehoundEthPriceFeed.address,
      synthetixPriceFeed: mainnet.contracts.SynthetixPriceFeed.address,
      uniswapV2PoolPriceFeed: mainnet.contracts.UniswapV2PoolPriceFeed.address,
      wdgldPriceFeed: mainnet.contracts.WdgldPriceFeed.address,

      // Peripheral
      fundActionsWrapper: mainnet.contracts.FundActionsWrapper.address,
      authUserExecutedSharesRequestorFactory: mainnet.contracts.AuthUserExecutedSharesRequestorFactory.address,

      // Fees
      managementFee: mainnet.contracts.ManagementFee.address,
      performanceFee: mainnet.contracts.PerformanceFee.address,
      entranceRateBurnFee: mainnet.contracts.EntranceRateBurnFee.address,
      entranceRateDirectFee: mainnet.contracts.EntranceRateDirectFee.address,

      // Policies
      adapterBlacklist: mainnet.contracts.AdapterBlacklist.address,
      adapterWhitelist: mainnet.contracts.AdapterWhitelist.address,
      assetBlacklist: mainnet.contracts.AssetBlacklist.address,
      assetWhitelist: mainnet.contracts.AssetWhitelist.address,
      investorWhitelist: mainnet.contracts.InvestorWhitelist.address,
      guaranteedRedemption: mainnet.contracts.GuaranteedRedemption.address,
      maxConcentration: mainnet.contracts.MaxConcentration.address,
      minMaxInvestment: mainnet.contracts.MinMaxInvestment.address,
      buySharesCallerWhitelist: mainnet.contracts.BuySharesCallerWhitelist.address,

      // Adapters
      trackedAssetsAdapter: mainnet.contracts.TrackedAssetsAdapter.address,
      compoundAdapter: mainnet.contracts.CompoundAdapter.address,
      chaiAdapter: mainnet.contracts.ChaiAdapter.address,
      kyberAdapter: mainnet.contracts.KyberAdapter.address,
      uniswapV2Adapter: mainnet.contracts.UniswapV2Adapter.address,
      paraSwapAdapter: mainnet.contracts.ParaSwapAdapter.address,
      zeroExV2Adapter: mainnet.contracts.ZeroExV2Adapter.address,
      synthetixAdapter: mainnet.contracts.SynthetixAdapter.address,
      alphaHomoraV1Adapter: mainnet.contracts.AlphaHomoraV1Adapter.address,
      aaveAdapter: mainnet.contracts.AaveAdapter.address,

      // External
      wethToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      // TODO: Expose all the external addresses under their right names.
      chaiIntegratee: mainnet.contracts['Config'].linkedData.chai.chai,
      kyberIntegratee: mainnet.contracts['Config'].linkedData.kyber.networkProxy,
      uniswapV2Integratee: mainnet.contracts['Config'].linkedData.uniswap.router,
      synthetixIntegratee: mainnet.contracts['Config'].linkedData.synthetix.snx,
      synthetixAddressResolver: mainnet.contracts['Config'].linkedData.synthetix.addressResolver,
      synthetixDelegateApprovals: mainnet.contracts['Config'].linkedData.synthetix.delegateApprovals,

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
    const globbed = glob.sync('**/*', { cwd: path.join(generated) });
    const files = globbed.filter((item) => {
      const stats = fs.statSync(path.join(generated, item));
      return stats.isFile();
    });

    const directories = globbed.filter((item) => {
      const stats = fs.statSync(path.join(generated, item));
      return stats.isDirectory();
    });

    files.forEach((item) => {
      const from = path.join(generated, item);
      const to = path.join(generated, path.basename(item));
      fs.renameSync(from, to);
    });

    directories.forEach((item) => {
      fs.rmdirSync(path.join(generated, item), { recursive: true });
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
