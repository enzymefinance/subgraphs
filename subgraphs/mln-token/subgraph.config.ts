import { Configurator, Contexts, DataSourceUserDeclaration } from '@enzymefinance/subgraph-cli';

const name = 'mln-token';

export const contexts: Contexts<{}> = {
  ethereum: {
    name,
    deploymentId: 'QmQXQcNKVNSuuw6DZJC3dL3efCKcEuTcZK4mSzwA4Tcdco',
    network: 'mainnet',
    variables: {},
  },
};

export const configure: Configurator<{}> = () => {
  const sources: DataSourceUserDeclaration[] = [
    {
      name: 'Token',
      block: 7130380,
      address: '0xec67005c4e498ec7f55e092bd1d35cbc47c91892',
      events: (abi) => [abi.getEvent('Transfer')],
    },
  ];

  return { sources };
};
