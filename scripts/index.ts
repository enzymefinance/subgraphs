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
      chaiPriceSource
      chaiIntegratee
      kyberIntegratee
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
      maxConcentration
      investorWhitelist
    }
  }
`;

interface Result {
  deployment: {
    chaiPriceSource: string;
    chaiIntegratee: string;
    kyberIntegratee: string;
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
    maxConcentration: string;
    investorWhitelist: string;
  };
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
        default: 'https://testnet.avantgarde.finance/graphql',
      });
    },
    async (args) => {
      const deploymentJson = (await request<Result>(args.deployment, query)).deployment;

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
