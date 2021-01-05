import { deploy } from '@crestproject/crestproject';
import { constants } from 'ethers';
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
  startBlock: 22890826,
  wethToken: '0x17DfFC200037e3544402F21b294061AF3929E86A',
  dispatcher: '0x80cE90D11AEA9cDdD27b5a3cAa5857BBd7a3bD26',
  vaultLib: '0x9c176c4eBD67a5A1C6cC750A298161931638eBF0',
  fundDeployer: '0xBB1a7eCA7DdF96b7B58Cf40C9A850bb4230e4A99',
  valueInterpreter: '0x2fa4B1f8Cbac0128d2E87ecdc44956C2160851f9',
  comptrollerLib: '0x801f71EF62a535930F99e45fe11B260D601198c3',
  fundActionsWrapper: '0x40e63c336d2aE41dFef953E05994EF1a6180027A',
  feeManager: '0x930665315065A4E3b63B149456Bb2c874766Bf9d',
  integrationManager: '0xfC93dCA83B71cbeF4f6a0eE34622212A511Fb1D6',
  policyManager: '0x8950E6621db1B4415494aA517D7aA0E371219be1',
  chainlinkPriceFeed: '0x31007740CdCe9e84BF60EB2735f9698003aD5210',
  chaiPriceFeed: '0xac19a1cF7831722C9374568F7A5328D428178599',
  aggregatedDerivativePriceFeed: '0xa0aA4882407D8F24d0Cc58ab0fD335ad84b60A75',
  chaiAdapter: '0xddAFB72Df94E8d6eE6b72a3d554123e6e784ccCf',
  kyberAdapter: '0x2F5A7C360eaa2ab2F2C54599bF74FAAEbdF1642b',
  managementFee: '0x62883fA60165Ca88073928af016936C1B1f3102a',
  performanceFee: '0x54db69052624C82500459e23E9D215eDC92Ec8a8',
  entranceRateDirectFee: '0x64dDE13deEdD08B1D5BdB929881ff69f7E59D3b3',
  entranceRateBurnFee: '0xEbcD328b4d07b600b112912bbF97955522c5B1ee',
  adapterBlacklist: '0x7Ead8b007fF0bE32110C9470000EbA1E68EAA86F',
  adapterWhitelist: '0xf9F76348B5eA462C22d31Fc328d9218C3796c346',
  assetBlacklist: '0xb4580FCe2E6Ac2bd5EF87E2333E807892Bff7dfa',
  assetWhitelist: '0xA6fea14AA910D795bDe95E76024A089Ce7A82b3e',
  buySharesCallerWhitelist: '0x08764aC03dDf5497183e86902cFD523Ce81D0262',
  guaranteedRedemption: '0x10D4341ed9E495f472868120EdC18c31ad975E78',
  investorWhitelist: '0x079AA4164057F6473076FD2ffaDdDC940359aFab',
  maxConcentration: '0x1cA1aD59633Ac6DCf3956CeFE37b8492972a66Dd',
  minMaxInvestment: '0x2249459c8987fa22f88C27d82E6612c40Fbb9Bf0',
  // NOTE: These are the official kovan aggregators from chainlink.
  eurChainlinkAggregator: '0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13',
  chfChainlinkAggregator: '0xed0616BeF04D374969f302a34AE4A63882490A8C',
  jpyChainlinkAggregator: '0xD627B1eF3AC23F1d3e576FA6206126F3c1Bd0942',
};

async function fetchDeployment(source: string): Promise<DeploymentWithMetadata> {
  if (source.startsWith('http://' || source.startsWith('https://'))) {
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
