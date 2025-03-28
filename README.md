# Enzyme Subgraphs

## Introduction

This repository contains the various subgraphs that Enzyme Finance uses:

- [enzyme-asset-universe](subgraphs/asset-universe/)
- [enzyme-core](subgraphs/enzyme-core/)
- [enzyme-diva-staking](subgraphs/diva-staking/)
- [enzyme-vault-balances](subgraphs/vault-balances/)
- [enzyme-vault-lineage](subgraphs/vault-lineage/)
- [enzyme-vault-shares](subgraphs/vault-shares/)
- [mln-token](subgraphs/mln-token/)

## Installation

Before you can use the Enzyme subgraphs, make sure you have the latest versions of [Node.js](https://nodejs.org), [pnpm](https://pnpm.io) installed.

Install project dependencies from the main directory:

```sh
pnpm install
```

## Subgraph Contexts

Each subgraph can be used in different contexts, i.e. for different deployments and chains.

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
pnpm graph auth --studio
```

Once logged in, go to the subgraph directory (in `/subgraphs/name-of-subgraph`) and run

```sh
pnpm upload <context>
```

## Deployed subgraphs

All subgraphs are deployed on the Graph network:

### Ethereum

- [enzyme-asset-universe](https://thegraph.com/explorer/subgraphs/4ZW3mDNgpDVy68RipQLJxvRw1FReJTfvA7nbB52J4Gjg)
- [enzyme-core](https://thegraph.com/explorer/subgraphs/9DLBBLep5UyU16kUQRvxBCMqko4q9XzuE4XsMMpARhKK)
- [enzyme-diva-staking](https://thegraph.com/explorer/subgraphs/7BwBCYDVsVViTKQjRtbGA63SoCkxQe7XsMYtQYijQyfn)
- [enzyme-vault-balances](https://thegraph.com/explorer/subgraphs/HwR7jTExHWNvQetTxRYEMQ5hywHyUkierAYvnGS7pBUS)
- [enzyme-vault-lineage](https://thegraph.com/explorer/subgraphs/5FdivFcUPmVSqCFkv3jqJh3QYjHjh1ztzd7GHiCAMP1h)
- [enzyme-vault-shares](https://thegraph.com/explorer/subgraphs/6p2L2gQ4Hw4Dh2kxZFDJbcqtbv44vrJbrBEh3EjS7qVo)
- [mln-token](https://thegraph.com/explorer/subgraphs/F76JsnQYRhnyHSs2Hx1NbDpUiDNd2jrqVEqnMx6bgdPk)

### Polygon

- [enzyme-asset-universe-polygon](https://thegraph.com/explorer/subgraphs/6gfWidQ9TBcHLyUPuL343dw8LpvXW7sALPPHpcZi7SKz)
- [enzyme-core-polygon](https://thegraph.com/explorer/subgraphs/GCAHDyqvZBLMwqdb9U7AqWAN4t4TSwR3aXMHDoUUFuRV)
- [enzyme-vault-balances-polygon](https://thegraph.com/explorer/subgraphs/tLbAAASbNgTZuqkVdPMs8RJBXLs9WZS7758t1maT86C)
- [enzyme-vault-lineage-polygon](https://thegraph.com/explorer/subgraphs/hQMwVerKMpt8ChLU33jhZ4GLmcP8q2fBhJzw4JRFq4q)
- [enzyme-vault-shares-polygon](https://thegraph.com/explorer/subgraphs/7Tahv9dmeKKcF2SUeHU3ZN4X52y8KGwPo5UaFidJb1hr)

### Arbitrum

- [enzyme-asset-universe-arbitrum](https://thegraph.com/explorer/subgraphs/J2DQQxBCL5qxzwickTR2YKxVH5Bnr3aUwYdVEYbaYbrJ)
- [enzyme-core-arbitrum](https://thegraph.com/explorer/subgraphs/8UJ5Bkf2eazZhXsAshhzQ2Keibcb8NFHBvXis9pb2C2Y)
- [enzyme-vault-balances-arbitrum](https://thegraph.com/explorer/subgraphs/F6uEWkrjChyqzfA3wdwRTKCBdzQYm9LPCFbaVj3tvudN)
- [enzyme-vault-lineage-arbitrum](https://thegraph.com/explorer/subgraphs/ErvkSrie41cprdwYAnLz7PAN44ZjJoqrLm14SyPvhbHa)
- [enzyme-vault-shares-arbitrum](https://thegraph.com/explorer/subgraphs/8pUZ51EFRYiMMdL5JLdjzYRjG5yqA2zv1KiMRHdrz9EH)
