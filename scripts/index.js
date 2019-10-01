#!/usr/bin/env node

const commander = require("commander");
const glob = require("glob");
const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const mustache = require("mustache");

commander
  .command("generate-subgraph [<deployment>]")
  .action(async deployment => {
    const protocol = path.dirname(
      require.resolve("@melonproject/protocol/package.json")
    );
    const dir = path.join(protocol, "deployments");
    const files = glob.sync("*.json", {
      cwd: dir
    });

    const file = await (async () => {
      if (!!deployment) {
        return path.join(dir, deployment);
      }

      const { answer } = await inquirer.prompt([
        {
          type: "list",
          name: "answer",
          message: "Which deployment do you want to use?",
          choices: files
        }
      ]);

      return path.join(dir, answer);
    })();

    const view = JSON.parse(
      fs.readFileSync(file, {
        encoding: "UTF-8"
      })
    );

    view.meta.network = view.meta.chain === 1 ? "mainnet" : "kovan";

    const rootDir = path.join(__dirname, "..");
    const staticsTemplate = fs.readFileSync(
      path.join(rootDir, "src", "statics.template.ts"),
      {
        encoding: "UTF-8"
      }
    );

    const subgraphTemplate = fs.readFileSync(
      path.join(rootDir, "subgraph.template.yaml"),
      {
        encoding: "UTF-8"
      }
    );

    const subgraphOutput = mustache.render(subgraphTemplate, view);
    const staticsOutput = mustache.render(staticsTemplate, view);

    fs.writeFileSync(path.join(rootDir, "subgraph.yaml"), subgraphOutput);
    fs.writeFileSync(path.join(rootDir, "src", "statics.ts"), staticsOutput);
  });

commander.on("command:*", () => {
  commander.help();
  process.exit(1);
});

commander.parse(process.argv);
if (!commander.args.length) {
  commander.help();
  process.exit(1);
}
