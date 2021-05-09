#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const yargs = require('yargs');
const handlebars = require('handlebars');
const graph = require('@graphprotocol/graph-cli/src/cli').run;
const root = path.join(__dirname, '..');

function loadConfig(context) {
  const cwd = path.resolve(process.cwd());
  const config = require(path.join(cwd, 'subgraph.config.js'));
  const abis = ['ERC20', 'ERC20NameBytes', 'ERC20SymbolBytes'].map((name) => ({
    name: `${name}Contract`,
    file: path.relative(cwd, path.join(root, `abis/${name}.json`)),
  }));

  return config(context, abis);
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

async function generateSubgraphManifest(config) {
  const templateFile = path.join(root, 'templates/subgraph.template.yaml');
  const outputFile = path.join(process.cwd(), 'subgraph.yaml');
  const templateContent = fs.readFileSync(templateFile, 'utf8');

  const compile = handlebars.compile(templateContent);
  const replaced = compile(config);

  fs.writeFileSync(outputFile, replaced);
}

async function deploySubgraph(config) {
  if (config.local) {
    await graph(['create', config.name, '--node', config.node]);
  }

  await graph(['deploy', config.name, '--node', config.node, '--ipfs', config.ipfs]);
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
      const config = loadConfig(args.context);

      console.log('Generating subgraph manifest');
      await generateSubgraphManifest(config);

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
      const config = loadConfig(args.context);

      console.log('Deploying subgraph');
      await deploySubgraph(config);
    },
  )
  .help().argv;
