#!/usr/bin/env node

require("dotenv-extended").load();

const yargs = require("yargs");
const path = require("path");
const fs = require("fs");
const mustache = require("mustache");

function networkForChainId(id) {
  switch (`${id}`) {
    case "1":
      return "mainnet";
    case "4":
      return "rinkeby";
    case "42":
      return "kovan";
    case "4447":
      return "dev";
  }

  throw new Error("Invalid chain.");
}

function startBlockForChainId(id) {
  switch (`${id}`) {
    case "1":
      return 7200000;
    case "4":
      return 5900000;
    case "42":
      return 15800000;
    case "4447":
      return 0;
  }

  throw new Error("Invalid chain.");
}

function openFile(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Failed to open file: ${file}`);
  }

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`Failed to read file: ${file}`);
  }
}

yargs
  .env("MELON")
  .command({
    command: "$0",
    alias: "graphgen",
    describe: "Generate the subgraph for a given deployment manifest.",
    handler: async args => {
      const view = args.deployment;
      view.conf.network = networkForChainId(view.conf.networkID);
      view.conf.block = startBlockForChainId(view.conf.networkID);

      const rootDir = path.join(__dirname, "..");

      const subgraphTemplate = fs.readFileSync(
        path.join(rootDir, "subgraph.template.yaml"),
        "utf8"
      );

      const subgraphOutput = mustache.render(subgraphTemplate, view);

      fs.writeFileSync(path.join(rootDir, "subgraph.yaml"), subgraphOutput);
    },
    builder: args =>
      args
        .option("deployment", {
          type: "string",
          coerce: openFile,
          description: "The deployment manifest."
        })
        .demandOption("deployment")
  })
  .help().argv;
