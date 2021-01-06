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
      eurChainlinkAggregator
      chfChainlinkAggregator
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
  chaiPriceFeed: string;
  aggregatedDerivativePriceFeed: string;
  chaiAdapter: string;
  kyberAdapter: string;
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
  eurChainlinkAggregator: string;
  chfChainlinkAggregator: string;
  jpyChainlinkAggregator: string;
}

interface DeploymentWithMetadata extends Deployment {
  networkName: string;
  startBlock: number;
}

// TODO: Derive this from the deployment output instead of hard-coding it.
const kovan: DeploymentWithMetadata = {
  networkName: 'kovan',
  startBlock: 22905845,
  wethToken: '0xa83037c0F46879E6d1fbddbcBDCf99E3037EA85E',
  dispatcher: '0xDf9BC49a9f0227FF8586CA4c5AB4F86DBF96225a',
  vaultLib: '0xaD1dAed5B0073a6002be78CF06284D8dF9884045',
  fundDeployer: '0xAC3F5203596478504B743bdfa9468E8721d9890b',
  valueInterpreter: '0xA8dEd3F33E43948a5Dcbe76293760708e52EBB55',
  comptrollerLib: '0x2c5d8b6Fe7b40B7085f04F4799Cb1c98411B02dc',
  fundActionsWrapper: '0xFa3f64498987649258cF78D77357E474Db03636D',
  feeManager: '0xC2A10e039722405d19008790bfFBd8B6A3F2Afab',
  integrationManager: '0xfB6B92Ca2d2760C3FCe631D9E18201f838405d46',
  policyManager: '0xaA801f2862f0E075E67Dfff5b028e29932092bAF',
  chainlinkPriceFeed: '0x2934E2883D959D3fBDB41D5868BA20e23404d6a6',
  chaiPriceFeed: '0xc4E8A24a9b485bEBfA8393EB78C647A23C2Ba8DB',
  aggregatedDerivativePriceFeed: '0xe273a6dba1d0D551Cb5C7c345327F11ce1075b73',
  chaiAdapter: '0x83d5c74c91035D23A971FC36f79fC7593807Af8c',
  kyberAdapter: '0x1d80B7416474a12EAD364bea951a3477427E4e39',
  managementFee: '0xdA8aaf3C77c5435C64AFF2694441df461898c1f0',
  performanceFee: '0xEF0e9cb527b89d4aDdd74d2A18b54c97B2a52B5a',
  entranceRateDirectFee: '0x685fc4CE8a71Ccd87F64279185EF738Ab83FBeD3',
  entranceRateBurnFee: '0x7Fe4999f1eA34520E7455FEec81A5342372a0283',
  adapterBlacklist: '0x92d9f8912Ccc7d5cDBeF5416C05C7d11002D12FC',
  adapterWhitelist: '0xaF9aC29964fFC1fA8F0B44952390B343fb75C9Dd',
  assetBlacklist: '0x0778956c3aDfF12a4029B18287FC7CB671CDbDaE',
  assetWhitelist: '0xbf2AB06613850B181acd51335681a5EA68E4466e',
  buySharesCallerWhitelist: '0x922A486939842D5957d1edFe595061a59841085D',
  guaranteedRedemption: '0xe86311fE83E8a4c049269aFE22dba1a012b25CA2',
  investorWhitelist: '0x14363039d242B4A3f0fd50722BdE60b1F58C6EbC',
  maxConcentration: '0xa8Dece0e28Ff28FF578703Db2aEF49F8784bdCE1',
  minMaxInvestment: '0xB8f54849B0C6D8cf86C2Fd965F6502480bc675b1',
  // NOTE: These are the official kovan aggregators from chainlink.
  eurChainlinkAggregator: '0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13',
  chfChainlinkAggregator: '0xed0616BeF04D374969f302a34AE4A63882490A8C',
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
