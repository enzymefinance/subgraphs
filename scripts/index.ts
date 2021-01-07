import fs from 'fs';
import glob from 'glob';
import request, { gql } from 'graphql-request';
import handlebars from 'handlebars';
import path from 'path';
import yargs from 'yargs';

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

// TODO: Derive this from the deployment output instead of hard-coding it.
const kovan: DeploymentWithMetadata = {
  networkName: 'kovan',
  startBlock: 22906438,
  wethToken: '0x80A49144D966d52D0A4C63eCF5864515889c05C1',
  dispatcher: '0xcE5d84E2c1B0e1D1CA374D5c390B21015d86FaD0',
  vaultLib: '0x46973df07D5eEdE62aA59Ff026d47d9b039f607a',
  fundDeployer: '0x30642589b962496171EAb59d5d26E4De53cF2487',
  valueInterpreter: '0x09E8B5922cE2ef90aF2F6fda8d16ffE91867fF5C',
  comptrollerLib: '0xc884f978d444d20db604C6C75d29221010Fe1E2a',
  fundActionsWrapper: '0xf49B04171335016688583cd06232d58F87FaF3B8',
  feeManager: '0x7cDe94405c40c0A5E50b649f71961a6B4130b7eF',
  integrationManager: '0xe887484F965339B8179f3606D4cDE8fD40d464ed',
  policyManager: '0x02c795F24933504177C59ce54969B7ff4D7aC2b5',
  chainlinkPriceFeed: '0x2287a3686DE192d61009F495F66B941FB096f948',
  aggregatedDerivativePriceFeed: '0x4988113e9bcECD6047e9155ac4416cdAe732a2EC',
  managementFee: '0x6022B6d79136A990B1f49f523699e8Eab821eaC3',
  performanceFee: '0x572fbedf3c866128aBb5b48265D5863036c424DE',
  entranceRateDirectFee: '0x2CB798978A2ED64Bc6b40E37dDE3bc6270563357',
  entranceRateBurnFee: '0xe84E21F2450Aed2034BA76B1Dd918609C09C51d2',
  adapterBlacklist: '0x4f595F0CaE38212c2A5467e56F7c833dd0F558c7',
  adapterWhitelist: '0xF2a043A0FFfb70309094330172c663FCe7A58d79',
  assetBlacklist: '0x040d3065B7E9FBFC0948110AcF3737928e92143E',
  assetWhitelist: '0x26f948CA5a9ceCf907933100f6a32A282E38C40f',
  buySharesCallerWhitelist: '0xE16e8710EE40147958670CFc52a0eFe01A279480',
  guaranteedRedemption: '0xdAb2718Cf6A24a58BF7c3d073D1c91ffaCA8C8a7',
  investorWhitelist: '0xcBC83e027066FF6162A4A9fEE191881CF34EbEc9',
  maxConcentration: '0x8A32eE2750Ad2D7213C87E6881666B6eFA4C059A',
  minMaxInvestment: '0x93A44b4F4f3D754F491bAd61DE55bd7D98FbED8a',
  // NOTE: These are the official kovan aggregators from chainlink.
  audChainlinkAggregator: '0x5813A90f826e16dB392abd2aF7966313fc1fd5B8',
  btcChainlinkAggregator: '0xF7904a295A029a3aBDFFB6F12755974a958C7C25',
  chfChainlinkAggregator: '0xed0616BeF04D374969f302a34AE4A63882490A8C',
  eurChainlinkAggregator: '0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13',
  gbpChainlinkAggregator: '0x28b0061f44E6A9780224AA61BEc8C3Fcb0d37de9',
  jpyChainlinkAggregator: '0xD627B1eF3AC23F1d3e576FA6206126F3c1Bd0942',
};

async function fetchDeployment(source: string): Promise<DeploymentWithMetadata> {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const deployment = (await request<{ deployment: Deployment }>(source, query)).deployment;
    return { ...deployment, networkName: 'mainnet', startBlock: 0 };
  }

  if (source === 'kovan') {
    return kovan;
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
