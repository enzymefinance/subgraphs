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
      wethToken
      dispatcher
      vaultLib
      fundDeployer
      valueInterpreter
      comptrollerLib
      fundActionsWrapper
      feeManager
      integrationManager
      policyManager
      chainlinkPriceFeed
      chaiPriceFeed
      aggregatedDerivativePriceFeed
      chaiAdapter
      kyberAdapter
      managementFee
      performanceFee
      entranceRateDirectFee
      entranceRateBurnFee
      adapterBlacklist
      adapterWhitelist
      assetBlacklist
      assetWhitelist
      buySharesCallerWhitelist
      guaranteedRedemption
      investorWhitelist
      maxConcentration
      minMaxInvestment
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
  wethToken: string;
  dispatcher: string;
  vaultLib: string;
  fundDeployer: string;
  valueInterpreter: string;
  comptrollerLib: string;
  fundActionsWrapper: string;
  feeManager: string;
  integrationManager: string;
  policyManager: string;
  chainlinkPriceFeed: string;
  aggregatedDerivativePriceFeed: string;
  managementFee: string;
  performanceFee: string;
  entranceRateDirectFee: string;
  entranceRateBurnFee: string;
  adapterBlacklist: string;
  adapterWhitelist: string;
  assetBlacklist: string;
  assetWhitelist: string;
  buySharesCallerWhitelist: string;
  guaranteedRedemption: string;
  investorWhitelist: string;
  maxConcentration: string;
  minMaxInvestment: string;
  // Aggregators for currency calculations.
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
    const kovanAddresses = {
      // NOTE: These are the official weth kovan address and aggregator addresses from chainlink.
      wethToken: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      audChainlinkAggregator: '0x5813A90f826e16dB392abd2aF7966313fc1fd5B8',
      btcChainlinkAggregator: '0xF7904a295A029a3aBDFFB6F12755974a958C7C25',
      chfChainlinkAggregator: '0xed0616BeF04D374969f302a34AE4A63882490A8C',
      eurChainlinkAggregator: '0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13',
      gbpChainlinkAggregator: '0x28b0061f44E6A9780224AA61BEc8C3Fcb0d37de9',
      jpyChainlinkAggregator: '0xD627B1eF3AC23F1d3e576FA6206126F3c1Bd0942',
    };

    return {
      networkName: 'kovan',
      startBlock: 22906438,
      ...kovanAddresses,

      // Addresses derived from the deployment output.
      dispatcher: kovan.contracts.Dispatcher.address,
      vaultLib: kovan.contracts.VaultLib.address,
      fundDeployer: kovan.contracts.FundDeployer.address,
      valueInterpreter: kovan.contracts.ValueInterpreter.address,
      comptrollerLib: kovan.contracts.ComptrollerLib.address,
      fundActionsWrapper: kovan.contracts.FundActionsWrapper.address,
      feeManager: kovan.contracts.FeeManager.address,
      integrationManager: kovan.contracts.IntegrationManager.address,
      policyManager: kovan.contracts.PolicyManager.address,
      chainlinkPriceFeed: kovan.contracts.ChainlinkPriceFeed.address,
      aggregatedDerivativePriceFeed: kovan.contracts.AggregatedDerivativePriceFeed.address,
      managementFee: kovan.contracts.ManagementFee.address,
      performanceFee: kovan.contracts.PerformanceFee.address,
      entranceRateDirectFee: kovan.contracts.EntranceRateDirectFee.address,
      entranceRateBurnFee: kovan.contracts.EntranceRateBurnFee.address,
      adapterBlacklist: kovan.contracts.AdapterBlacklist.address,
      adapterWhitelist: kovan.contracts.AdapterWhitelist.address,
      assetBlacklist: kovan.contracts.AssetBlacklist.address,
      assetWhitelist: kovan.contracts.AssetWhitelist.address,
      buySharesCallerWhitelist: kovan.contracts.BuySharesCallerWhitelist.address,
      guaranteedRedemption: kovan.contracts.GuaranteedRedemption.address,
      investorWhitelist: kovan.contracts.InvestorWhitelist.address,
      maxConcentration: kovan.contracts.MaxConcentration.address,
      minMaxInvestment: kovan.contracts.MinMaxInvestment.address,
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
