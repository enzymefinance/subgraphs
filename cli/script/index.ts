import fs from 'fs';
import glob from 'glob';
import path from 'path';
import yargs from 'yargs';
import handlebars from 'handlebars';
import { Configurator, Environment } from '@enzymefinance/subgraph-cli';

const graph = require('@graphprotocol/graph-cli/src/cli').run as (args?: string[]) => Promise<void>;
const root = path.join(__dirname, '..');

const defaultLocalNode = 'http://127.0.0.1:8020/';
const defaultLocalIpfs = 'http://localhost:5001/';
const defaultRemoteNode = 'https://api.thegraph.com/deploy/';
const defaultRemoteIpfs = 'https://api.thegraph.com/ipfs/';

function loadEnvironment(ctx: string) {
  const cwd = process.cwd();

  const configure: Configurator<any> = (contexts, callback) => {
    const context = contexts[ctx];
    if (context == null) {
      throw new Error(`Invalid context ${context}. Available contexts: ${Object.keys(contexts).join(', ')}`);
    }

    const manifest = callback(context.variables);

    return {
      name: context.name,
      network: context.network,
      local: context.local ? true : false,
      node: context.node ? context.node : context.local ? defaultLocalNode : defaultRemoteNode,
      ipfs: context.ipfs ? context.ipfs : context.local ? defaultLocalIpfs : defaultRemoteIpfs,
      variables: context.variables,
      manifest,
    };
  };

  const abis = ['ERC20', 'ERC20NameBytes', 'ERC20SymbolBytes'].map((name) => ({
    name: `${name}Contract`,
    file: `@enzymefinance/subgraph-utils/abis/${name}.json`,
  }));

  const environment = require(path.join(cwd, 'subgraph.config.ts')).default(configure) as Environment<any>;
  environment.manifest.abis = [...environment.manifest.abis, ...abis]
    .filter((item, index, array) => array.findIndex((inner) => inner.name === item.name) === index)
    .map((item) => ({
      name: item.name,
      file: path.relative(cwd, require.resolve(item.file)),
    }));

  return environment;
}

async function generateCode() {
  await graph(['codegen']);

  const cwd = path.resolve(process.cwd(), 'generated');
  const globbed = glob.sync('**/*', {
    cwd,
    absolute: true,
  });

  const files = globbed.filter((item) => fs.statSync(item).isFile());
  const directories = globbed.filter((item) => fs.statSync(item).isDirectory());

  files.forEach((item) => fs.renameSync(item, path.join(cwd, path.basename(item))));
  directories.forEach((item) => fs.rmdirSync(item, { recursive: true }));
}

async function generateSubgraphManifest(environment: Environment<any>) {
  const templateFile = path.join(root, 'templates/subgraph.template.yaml');
  const outputFile = path.join(process.cwd(), 'subgraph.yaml');
  const templateContent = fs.readFileSync(templateFile, 'utf8');

  const compile = handlebars.compile(templateContent);
  const replaced = compile(environment.manifest);

  fs.writeFileSync(outputFile, replaced);
}

async function deploySubgraph(environment: Environment<any>) {
  if (environment.local) {
    await graph(['create', environment.name, '--node', environment.node]);
  }

  await graph(['deploy', environment.name, '--node', environment.node, '--ipfs', environment.ipfs]);
}

yargs
  .command(
    'codegen <context>',
    'Generate the subgraph manifest and code.',
    (builder) => {
      builder.positional('context', {
        description: 'The configuration context (e.g. network name).',
      });
    },
    async (args) => {
      const environment = loadEnvironment(args.context as string);

      console.log('Generating subgraph manifest');
      await generateSubgraphManifest(environment);

      console.log('Generating code');
      await generateCode();
    },
  )
  .command(
    'deploy <context>',
    'Deploy the subgraph.',
    (builder) => {
      builder.positional('context', {
        description: 'The configuration context (e.g. network name).',
      });
    },
    async (args) => {
      const environment = loadEnvironment(args.context as string);

      console.log('Deploying subgraph');
      await deploySubgraph(environment);
    },
  )
  .demandCommand()
  .help().argv;
