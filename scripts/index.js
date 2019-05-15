const commander = require('commander');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const mustache = require('mustache');

commander.command('generate-subgraph [<deployment>]').action(async deployment => {
  const protocol = path.dirname(require.resolve('@melonproject/protocol/package.json'));
  const dir = path.join(protocol, 'deployments');
  const files = glob.sync('*.json', {
    cwd: dir,
  });

  const file = await (async () => {
    if (!!deployment) {
      return path.join(dir, deployment);
    }

    const { answer } = await inquirer.prompt([{
      type: 'list',
      name: 'answer',
      message: 'Which deployment do you want to use?',
      choices: files,
    }]);

    return path.join(dir, answer);
  })();

  const view = JSON.parse(fs.readFileSync(file, {
    encoding: 'UTF-8'
  }));

  const template = fs.readFileSync(path.join(__dirname, '..', 'subgraph.template.yaml'), {
    encoding: 'UTF-8',
  });

  const output = mustache.render(template, view);
  fs.writeFileSync(path.join(__dirname, '..', 'subgraph.yaml'), output);
});

commander.on('command:*', () => {
  commander.help();
  process.exit(1);
});

commander.parse(process.argv);
if (!commander.args.length) {
  commander.help();
  process.exit(1);
}

