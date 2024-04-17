import fs from 'node:fs';
import path from 'node:path';
import { $ } from 'execa';
import glob, { globSync } from 'glob';
import handlebars from 'handlebars';
import yargs from 'yargs';
import { Configurator, Context, Contexts, Environment, ManifestValues, Template } from './types';
import { formatJson, sdkDeclaration, sourceDeclaration, templateDeclaration } from './utils';

const root = path.join(__dirname, '..');

const defaultLocalNode = 'http://localhost:8020/';
const defaultLocalIpfs = 'http://localhost:5001/';
const defaultRemoteNode = 'https://api.thegraph.com/deploy/';
const defaultRemoteIpfs = 'https://api.thegraph.com/ipfs/api/v0';

class SubgraphLoader<TVariables = any> {
  public readonly contexts: Contexts<TVariables>;
  protected readonly configure: Configurator<TVariables>;
  protected readonly templates: Template[];

  constructor(public readonly root: string) {
    const config = require(path.join(root, 'subgraph.config.ts'));

    this.templates = config.templates ?? [];
    this.contexts = config.contexts;
    this.configure = config.configure;
  }

  public load(ctx: string) {
    const context: Context<TVariables> = this.contexts[ctx];
    if (context == null) {
      throw new Error(`Invalid context ${context}. Available contexts: ${Object.keys(this.contexts).join(', ')}`);
    }

    const configuration = this.configure(context.variables);

    const manifest: ManifestValues = {
      network: context.network,
      sources: [],
    };

    manifest.network = context.network;
    manifest.sources = configuration.sources
      .map((item) => sourceDeclaration(item, this.root))
      .filter((item) => item.address !== '0x0000000000000000000000000000000000000000');

    manifest.templates = configuration.templates?.map((item) => templateDeclaration(item, this.root));
    manifest.sdks = configuration.sdks?.map((item) => sdkDeclaration(item, this.root));

    const environment: Environment<TVariables> = {
      name: context.name,
      network: context.network,
      local: context.local ? true : false,
      node: context.node ? context.node : context.local ? defaultLocalNode : defaultRemoteNode,
      ipfs: context.ipfs ? context.ipfs : context.local ? defaultLocalIpfs : defaultRemoteIpfs,
      variables: context.variables,
      manifest,
    };

    return new Subgraph(environment, this.root, this.templates);
  }
}

class Subgraph<TVariables = any> {
  constructor(
    public readonly environment: Environment<TVariables>,
    public readonly root: string,
    public readonly templates: Template[] = [],
  ) {}

  public async generateManifest() {
    const templateFile = path.join(root, 'templates/subgraph.template.yaml');
    const outputFile = path.join(this.root, 'subgraph.yaml');
    const templateContent = fs.readFileSync(templateFile, 'utf8');

    const compile = handlebars.compile(templateContent);
    const replaced = compile(this.environment.manifest);

    fs.writeFileSync(outputFile, replaced);
  }

  public async generateAbis() {
    this.environment.manifest.sources.forEach((source) => {
      const formattedFragments = source.events.map((event) => formatJson(event.fragment));
      const jsonOutput = JSON.stringify(formattedFragments, undefined, 2);
      const outputFile = path.join(this.root, source.abi.file);
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, jsonOutput);
    });

    this.environment.manifest.templates?.forEach((template) => {
      const formattedFragments = template.events.map((event) => formatJson(event.fragment));
      const jsonOutput = JSON.stringify(formattedFragments, undefined, 2);
      const outputFile = path.join(this.root, template.abi.file);
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, jsonOutput);
    });

    this.environment.manifest.sdks?.forEach((sdk) => {
      const formattedFragments = sdk.functions.map((fn) => formatJson(fn));
      const jsonOutput = JSON.stringify(formattedFragments, undefined, 2);
      const outputFile = path.join(this.root, sdk.file);
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, jsonOutput);
    });
  }

  public async generateCode() {
    const generatedDir = path.join(this.root, 'generated');
    const outputDir = path.join(generatedDir, 'contracts');
    const command = $`graph codegen --skip-migrations --output-dir ${outputDir}`;
    command.stdout?.pipe(process.stdout);
    command.stderr?.pipe(process.stderr);
    await command;

    fs.renameSync(path.join(outputDir, 'schema.ts'), path.join(generatedDir, 'schema.ts'));
    if (fs.existsSync(path.join(outputDir, 'templates.ts'))) {
      fs.renameSync(path.join(outputDir, 'templates.ts'), path.join(generatedDir, 'templates.ts'));
    }

    const globbed = globSync('**/*', { cwd: outputDir, absolute: true });
    const files = globbed.filter((item) => fs.statSync(item).isFile());
    const directories = globbed
      .filter((item) => fs.statSync(item).isDirectory())
      .filter((outer, _, array) => !array.some((inner) => inner !== outer && outer.startsWith(inner)));

    files.forEach((item) => fs.renameSync(item, path.join(outputDir, path.basename(item))));
    directories.forEach((item) => fs.rmSync(item, { recursive: true }));

    this.templates.forEach((template) => {
      const templateFile = path.join(this.root, template.template);
      const outputFile = path.join(this.root, template.destination);
      const outputDir = path.dirname(outputFile);
      const templateContent = fs.readFileSync(templateFile, 'utf8');

      const compile = handlebars.compile(templateContent);
      const replaced = compile(this.environment.variables, {
        helpers: {
          or: (a: any, b: any) => a ?? b,
        },
      });

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, replaced);
    });
  }

  public async deploySubgraph() {
    const command = $`graph deploy --skip-migrations ${this.environment.name} --node ${this.environment.node} --ipfs ${this.environment.ipfs} --output-dir ${path.join(this.root, 'build/subgraph')}`;
    command.stdout?.pipe(process.stdout);
    command.stderr?.pipe(process.stderr);
    await command;
  }

  public async buildSubgraph() {
    const command = $`graph build --skip-migrations --output-dir ${path.join(this.root, 'build/subgraph')}`;
    command.stdout?.pipe(process.stdout);
    command.stderr?.pipe(process.stderr);
    await command;
  }

  public async createSubgraph() {
    if (!this.environment.local) {
      return;
    }

    const command = $`graph create ${this.environment.name} --node ${this.environment.node}`;
    command.stdout?.pipe(process.stdout);
    command.stderr?.pipe(process.stderr);
    await command;
  }
}

interface Args {
  subgraph: Subgraph;
}

yargs
  .env('ENZYME_SUBGRAPH')
  .option('cwd', {
    type: 'string',
    description: 'The working directory',
    default: process.cwd(),
  })
  .positional('context', {
    type: 'string',
    description: 'The configuration context (e.g. network name).',
  })
  .demandOption(['cwd', 'context'])
  .middleware((args) => {
    const builder = new SubgraphLoader(args.cwd);
    const contexts = Object.keys(builder.contexts);

    if (!contexts.length) {
      console.error('No available contexts.');
      process.exit(1);
    }

    if (!contexts.includes(args.context)) {
      console.error(`Invalid context "${args.context}". Available contexts: "${contexts.join('", "')}"`);
      process.exit(1);
    }

    const subgraph = builder.load(args.context);
    args.subgraph = subgraph;
  })
  .command<Args>(
    'codegen <context>',
    'Generate the subgraph manifest and code.',
    () => {},
    async ({ subgraph }) => {
      console.log('Generating event abis');
      await subgraph.generateAbis();

      console.log('Generating subgraph manifest');
      await subgraph.generateManifest();

      console.log('Generating code');
      await subgraph.generateCode();
    },
  )
  .command<Args>(
    'build <context>',
    'Compile the subgraph code into the wasm runtimes.',
    () => {},
    async ({ subgraph }) => {
      console.log('Generating code');
      await subgraph.buildSubgraph();
    },
  )
  .command<Args>(
    'deploy <context>',
    'Deploy the subgraph.',
    () => {},
    async ({ subgraph }) => {
      console.log('Generating event abis');
      await subgraph.generateAbis();

      console.log('Generating subgraph manifest');
      await subgraph.generateManifest();

      console.log('Generating code');
      await subgraph.generateCode();

      console.log('Deploying subgraph');
      await subgraph.createSubgraph();
      await subgraph.deploySubgraph();
    },
  )
  .demandCommand()
  .help().argv;
