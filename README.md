# Enzyme Subgraphs

## Introduction

This repository contains the various subgraphs that Enzyme Finance uses:

- [asset-universe](subgraphs/asset-universe/)
- [enzyme-core](subgraphs/enzyme-core/)
- [mln-token](subgraphs/mln-token/)
- [vault-balances](subgraphs/vault-balances/)
- [vault-lineage](subgraphs/vault-lineage/)
- [vault-shares](subgraphs/vault-shares/)

## Installation

Before you can use the Enzyme subgraphs, make sure you have the latest versions of [Node.js](https://nodejs.org), [pnpm](https://pnpm.io) installed.

Install project dependencies from the main directory:

```sh
pnpm install
```

## Subgraph Contexts

Each subgraph can be used in different contexts, i.e. for different deployements and chains.

Default contexts are:

- ethereum
- polygon

## Run code generators for a subgraph

In order to generate a `subgraph.yaml` file and AssemblyScript classes for a specific subgraph, go to the subgraph directory (in `/subgraphs/name-of-subgraph`) and run

```sh
pnpm codegen <context>
```

## Build a subgraph

Code generation does not check your mapping code. If you want to check the mapping code before uploading it, run

```sh
pnpm build <context>
```

## Deploy a subgraph

To deploy a subgraph to the default location, you need to be logged into the Graph CLI:

```sh
pnpm graph auth
```

Once logged in, go to the subgraph directory (in `/subgraphs/name-of-subgraph`) and run

```sh
pnpm upload <context>
```

## Deployed subgraphs

All subgraphs are deployed on the hosted network:

- [asset-universe](https://thegraph.com/hosted-service/subgraph/enzymefinance/asset-universe)
- [enzyme-core](https://thegraph.com/hosted-service/subgraph/enzymefinance/enzyme-core)
- [mln-token](https://thegraph.com/hosted-service/subgraph/enzymefinance/mln-token)
- [vault-balances](https://thegraph.com/hosted-service/subgraph/enzymefinance/vault-balances)
- [vault-lineage](https://thegraph.com/hosted-service/subgraph/enzymefinance/vault-lineage)
- [vault-shares](https://thegraph.com/hosted-service/subgraph/enzymefinance/vault-shares)
- [diva](https://thegraph.com/hosted-service/subgraph/enzymefinance/diva)

Some subgraphs are also deployed on the decentralized network:

- [vault-lineage](https://thegraph.com/explorer/subgraphs/471kuUZjCjg75KhH8AdpUzpsnre1BsEWLJPhXG9KeZyg?view=Overview)
