# Melon Subgraph

> The official subgraph (thegraph.com) for the Melon Protocol.

## Development

Before you can start developing, you'll need to have [Node.js][node], [Yarn][yarn] and [Docker][docker], installed.

Installing only takes two commands and you're ready to roll:

```bash
# Install all dependencies.
yarn install

# Generate the subgraph and code.
yarn codegen
```

In order to deploy the subgraph locally, you need to start the dockerized development dependencies (ganache, graph-node, ipfs).

```bash
docker-compose up -d
```

You are now ready to start development. Documentation is available [here](https://thegraph.com/docs). There are also several helpful scripts in package.json for testing, and deploying the subgraph locally.

In order to deploy the subgraph locally, all you need to do is.

```bash
yarn make && yarn deploy
```

## Contributing

Third party contributions to this project are welcome and encouraged. If you want to contribute, please open an issue before submtting a pull requests so we can discuss the proposed changes and/or additions.

Please note that all repositories hosted under this organization follow our [Code of Conduct][coc], make sure to review and follow it.

[yarn]: https://yarnpkg.com
[node]: https://nodejs.org
[docker]: https://www.docker.com/
[coc]: https://github.com/enzymefinance/enzymejs/blob/master/CODE_OF_CONDUCT.md
