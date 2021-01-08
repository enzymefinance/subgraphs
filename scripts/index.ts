import fs from 'fs';
import glob from 'glob';
import request, { gql } from 'graphql-request';
import handlebars from 'handlebars';
import path from 'path';
import yargs from 'yargs';
import kovan from './deployments/kovan.json';

const query = gql`
  {
    deployment {
      # Core
      dispatcher
      fundDeployer
      vaultLib
      comptrollerLib
      valueInterpreter
      integrationManager
      policyManager
      feeManager

      # Prices
      aggregatedDerivativePriceFeed
      chainlinkPriceFeed

      # Peripheral
      fundActionsWrapper

      # Fees
      managementFee
      performanceFee
      entranceRateBurnFee
      entranceRateDirectFee

      # Policies
      adapterBlacklist
      adapterWhitelist
      assetBlacklist
      assetWhitelist
      investorWhitelist
      guaranteedRedemption
      maxConcentration
      minMaxInvestment
      buySharesCallerWhitelist

      # Adapters
      trackedAssetsAdapter
      compoundAdapter
      chaiAdapter
      kyberAdapter
      uniswapV2Adapter
      paraSwapAdapter
      zeroExV2Adapter
      synthetixAdapter

      # External
      wethToken
      chaiIntegratee
      kyberIntegratee
      uniswapV2Integratee
      synthetixIntegratee
      synthetixAddressResolver
      synthetixDelegateApprovals

      # Currencies
      audChainlinkAggregator
      btcChainlinkAggregator
      chfChainlinkAggregator
      eurChainlinkAggregator
      gbpChainlinkAggregator
      jpyChainlinkAggregator
    }
  }
`;

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
  trackedAssetsAdapter: string;
  compoundAdapter: string;
  chaiAdapter: string;
  kyberAdapter: string;
  uniswapV2Adapter: string;
  paraSwapAdapter: string;
  zeroExV2Adapter: string;
  synthetixAdapter: string;

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
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const deployment = (await request<{ deployment: Deployment }>(source, query)).deployment;
    return { ...deployment, networkName: 'mainnet', startBlock: 0 };
  }

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

      // Peripheral
      fundActionsWrapper: kovan.contracts.FundActionsWrapper.address,

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

      // External
      wethToken: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      chaiIntegratee: kovan.contracts['mocks/MockChaiIntegratee'].address,
      kyberIntegratee: kovan.contracts['mocks/MockKyberIntegratee'].address,
      uniswapV2Integratee: kovan.contracts['mocks/MockUniswapV2Integratee'].address,
      synthetixIntegratee: kovan.contracts['mocks/MockSynthetixIntegratee'].address,
      synthetixAddressResolver: kovan.contracts['mocks/MockSynthetixIntegratee'].address,
      synthetixDelegateApprovals: kovan.contracts['mocks/MockSynthetixIntegratee'].address,

      // Currencies
      audChainlinkAggregator: '0x5813A90f826e16dB392abd2aF7966313fc1fd5B8',
      btcChainlinkAggregator: '0xF7904a295A029a3aBDFFB6F12755974a958C7C25',
      chfChainlinkAggregator: '0xed0616BeF04D374969f302a34AE4A63882490A8C',
      eurChainlinkAggregator: '0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13',
      gbpChainlinkAggregator: '0x28b0061f44E6A9780224AA61BEc8C3Fcb0d37de9',
      jpyChainlinkAggregator: '0xD627B1eF3AC23F1d3e576FA6206126F3c1Bd0942',
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
    'Create the subgraph manifest from the template.',
    (yargs) => {
      return yargs.option('deployment', {
        type: 'string',
        default: 'https://evm.testnet.enzyme.finance/graphql',
      });
    },
    async (args) => {
      const deploymentJson = await fetchDeployment(args.deployment);

      {
        const templateFile = path.join(__dirname, '../templates/subgraph.yml');
        const subgraphFile = path.join(__dirname, '../subgraph.yaml');
        const templateContent = fs.readFileSync(templateFile, 'utf8');

        const compile = handlebars.compile(templateContent);
        const replaced = compile(deploymentJson);

        fs.writeFileSync(subgraphFile, replaced);
      }

      {
        const templateFile = path.join(__dirname, '../templates/addresses.ts');
        const subgraphFile = path.join(__dirname, '../src/addresses.ts');
        const templateContent = fs.readFileSync(templateFile, 'utf8');

        const compile = handlebars.compile(templateContent);
        const replaced = compile(deploymentJson);

        fs.writeFileSync(subgraphFile, replaced);
      }
    },
  )
  .help().argv;
