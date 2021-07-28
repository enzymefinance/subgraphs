import fs from 'fs';
import glob from 'glob';
import path from 'path';
import yargs from 'yargs';
import handlebars from 'handlebars';
import { Configurator, Context, Contexts, Environment, ManifestValues, Template } from '@enzymefinance/subgraph-cli';
import { abi, source, template } from './utils';

const graph = require('@graphprotocol/graph-cli/src/cli').run as (args?: string[]) => Promise<void>;
const root = path.join(__dirname, '..');

const defaultLocalNode = 'http://127.0.0.1:8020/';
const defaultLocalIpfs = 'http://localhost:5001/';
const defaultRemoteNode = 'https://api.thegraph.com/deploy/';
const defaultRemoteIpfs = 'https://api.thegraph.com/ipfs/';

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
    const abis = [
      '@enzymefinance/subgraph-utils/abis/ERC20.json',
      '@enzymefinance/subgraph-utils/abis/ERC20NameBytes.json',
      '@enzymefinance/subgraph-utils/abis/ERC20SymbolBytes.json',
    ];

    const manifest: ManifestValues = {
      network: context.network,
      sources: [],
      abis: [],
    };

    manifest.network = context.network;
    manifest.abis = [...(configuration.abis ?? []), ...abis]
      .map((item) => abi(item, this.root))
      .filter((item, index, array) => array.findIndex((inner) => inner.name === item.name) === index);

    manifest.sources = configuration.sources.map((item) => source(item));
    manifest.templates = configuration.templates?.map((item) => template(item));

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

  public async generateCode() {
    await graph(['codegen', '--skip-migrations', 'true']);

    const cwd = path.resolve(this.root, 'generated');
    const globbed = glob.sync('**/*', {
      cwd,
      absolute: true,
    });

    const files = globbed.filter((item) => fs.statSync(item).isFile());

    // Filter out child directories.
    const directories = globbed
      .filter((item) => fs.statSync(item).isDirectory())
      .filter((outer, _, array) => !array.some((inner) => inner !== outer && outer.startsWith(inner)));

    files.forEach((item) => fs.renameSync(item, path.join(cwd, path.basename(item))));
    directories.forEach((item) => fs.rmdirSync(item, { recursive: true }));

    this.templates.forEach((template) => {
      const templateFile = path.join(this.root, template.template);
      const outputFile = path.join(this.root, template.destination);
      const outputDir = path.dirname(outputFile);
      const templateContent = fs.readFileSync(templateFile, 'utf8');

      const compile = handlebars.compile(templateContent);
      const replaced = compile(this.environment.variables);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, replaced);
    });
  }

  public async deploySubgraph() {
    await graph([
      'deploy',
      this.environment.name,
      '--node',
      this.environment.node,
      '--ipfs',
      this.environment.ipfs,
      '--skip-migrations',
      'true',
      '--output-dir',
      path.join(this.root, 'build/subgraph'),
    ]);
  }

  public async buildSubgraph() {
    await graph(['build', '--skip-migrations', 'true', '--output-dir', path.join(this.root, 'build/subgraph')]);
  }

  public async createSubgraph() {
    if (!this.environment.local) {
      return;
    }

    await graph(['create', this.environment.name, '--node', this.environment.node]);
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
      console.log('Generating subgraph manifest');
      await subgraph.generateManifest();

      console.log('Generating code');
      await subgraph.generateCode();

      console.log('Generating code');
      await subgraph.buildSubgraph();
    },
  )
  .command<Args>(
    'deploy <context>',
    'Deploy the subgraph.',
    () => {},
    async ({ subgraph }) => {
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
