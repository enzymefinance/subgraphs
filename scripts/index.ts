import fs from 'fs';
import path from 'path';
import glob from 'glob';
import yargs from 'yargs';
import handlebars from 'handlebars';
import request, { gql } from 'graphql-request';

const query = gql`
  {
    deployment {
      chaiPriceSource
      chaiIntegratee
      kyberIntegratee
      dispatcher
      vaultLib
      fundDeployer
      valueInterpreter
      engine
      comptrollerLib
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
      adapterBlacklist
      adapterWhitelist
      assetBlacklist
      assetWhitelist
      maxConcentration
      userWhitelist
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
    engine: string;
    comptrollerLib: string;
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
    adapterBlacklist: string;
    adapterWhitelist: string;
    assetBlacklist: string;
    assetWhitelist: string;
    maxConcentration: string;
    userWhitelist: string;
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
        default: 'http://localhost:4000/graphql',
      });
    },
    async (args) => {
      const deploymentJson = await (await request<Result>(args.deployment, query)).deployment;

      const templateFile = path.join(__dirname, '..', 'subgraph.template.yml');
      const subgraphFile = path.join(__dirname, '..', 'subgraph.yaml');
      const templateContent = fs.readFileSync(templateFile, 'utf8');

      const compile = handlebars.compile(templateContent);
      const replaced = compile(deploymentJson);

      fs.writeFileSync(subgraphFile, replaced);
    },
  )
  .help().argv;
