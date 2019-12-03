#!/usr/bin/env node

const commander = require("commander");
const glob = require("glob");
const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const mustache = require("mustache");

async function loadDeployment(deployment) {
  if (typeof deployment !== "undefined") {
    return path.resolve(deployment);
  }

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
}

commander
  .command("generate-subgraph [<deployment>]")
  .action(async deployment => {
    const file = await loadDeployment(deployment);

    const view = JSON.parse(
      fs.readFileSync(file, {
        encoding: "UTF-8"
      })
    );

    view.meta.network = (() => {
      switch (view.meta.chain) {
        case 1:
          return "mainnet";
        case 42:
          return "kovan";
        default:
          return "dev";
      }
    })();

    view.meta.block = (() => {
      switch (view.meta.chain) {
        case 1:
          return 7278328;
        case 42:
          return 0;
        default:
          return 0;
      }
    })();

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

    const subgraphOutput = mustache.render(subgraphTemplate, view, undefined, [
      "${{",
      "}}"
    ]);

    const staticsOutput = mustache.render(staticsTemplate, view, undefined, [
      "${{",
      "}}"
    ]);

    fs.writeFileSync(path.join(rootDir, "subgraph.yaml"), subgraphOutput);
    fs.writeFileSync(path.join(rootDir, "src", "statics.ts"), staticsOutput);
  });

commander.on("command:*", () => {
  commander.help();
  process.exit(1);
});

commander.parse(process.argv);
