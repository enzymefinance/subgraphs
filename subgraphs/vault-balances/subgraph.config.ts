import { Configurator, Contexts } from '@enzymefinance/subgraph-cli';

interface Variables {
  dispatcher: string;
  start: number;
}

const name = 'enzymefinance/vault-balances';

export const contexts: Contexts<Variables> = {
  kovan: {
    name: `${name}-kovan`,
    network: 'kovan',
    variables: {
      dispatcher: '0xb5f802D8e7d4c8aCD51e7097fAA03F286e90609d',
      start: 27217130,
    },
  },
  mainnet: {
    name,
    network: 'mainnet',
    variables: {
      dispatcher: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
      start: 11681281,
    },
  },
  local: {
    local: true,
    name,
    network: 'kovan',
    variables: {
      dispatcher: '0xba9493530494958EC2DeED9c8BB34004ff37Ad28',
      start: 24710049,
    },
  },
};

export const configure: Configurator<Variables> = (variables) => ({
  abis: ['./abis/Dispatcher.json', './abis/Vault.json'],
  sources: [
    {
      name: 'Dispatcher',
      block: variables.start,
      address: variables.dispatcher,
      events: [
        'VaultProxyDeployed(indexed address,indexed address,address,indexed address,address,string)',
        'MigrationExecuted(indexed address,indexed address,indexed address,address,address,uint256)',
      ],
    },
    {
      name: 'Asset',
      abi: 'ERC20Contract', // Inherited from global abis.
      block: variables.start,
      events: ['Transfer(indexed address,indexed address,uint256)'],
    },
  ],
  templates: [
    {
      name: 'Vault',
      events: ['TrackedAssetAdded(address)', 'TrackedAssetRemoved(address)'],
    },
  ],
});
