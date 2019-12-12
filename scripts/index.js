#!/usr/bin/env node

require("dotenv-extended").load();

const yargs = require("yargs");
const path = require("path");
const fs = require("fs");
const mustache = require("mustache");

function networkForChainId(id) {
  switch (id) {
    case 1:
      return "mainnet";
    case 42:
      return "kovan";
    case 4:
      return "dev";
  }

  throw new Error("Invalid chain.");
}

function startBlockForChainId(id) {
  switch (id) {
    case 1:
      return 7200000;
    case 42:
      return 0;
    case 4:
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
      view.meta.network = networkForChainId(view.meta.chain);
      view.meta.block = startBlockForChainId(view.meta.chain);

      const rootDir = path.join(__dirname, "..");
      const staticsTemplate = fs.readFileSync(
        path.join(rootDir, "src", "statics.template.ts"),
        "utf8"
      );
      const subgraphTemplate = fs.readFileSync(
        path.join(rootDir, "subgraph.template.yaml"),
        "utf8"
      );

      const subgraphOutput = mustache.render(subgraphTemplate, view);
      const staticsOutput = mustache.render(staticsTemplate, view);

      fs.writeFileSync(path.join(rootDir, "subgraph.yaml"), subgraphOutput);
      fs.writeFileSync(path.join(rootDir, "src", "statics.ts"), staticsOutput);
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
