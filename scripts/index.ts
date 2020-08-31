import fs from 'fs';
import path from 'path';
import glob from 'glob';
import yargs from 'yargs';
import axios from 'axios';
import handlebars from 'handlebars';

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
        default: 'http://localhost:4000/deployment',
      });
    },
    async (args) => {
      const deploymentJson = await axios
        .get(args.deployment)
        .then((result) => result.data);

      const templateFile = path.join(__dirname, '..', 'subgraph.template.yml');
      const subgraphFile = path.join(__dirname, '..', 'subgraph.yaml');
      const templateContent = fs.readFileSync(templateFile, 'utf8');

      const compile = handlebars.compile(templateContent);
      const replaced = compile(deploymentJson);

      fs.writeFileSync(subgraphFile, replaced);
    },
  )
  .help().argv;
