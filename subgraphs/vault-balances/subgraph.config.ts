import { Configurator, Contexts } from '@enzymefinance/subgraph-cli';

interface Variables {
  block: number;
  dispatcher: string;
}

export const contexts: Contexts<Variables> = {
  local: {
    local: true,
    name: 'enzymefinance/vault-balances',
    network: 'kovan',
    variables: {
      dispatcher: '0xba9493530494958EC2DeED9c8BB34004ff37Ad28',
      block: 24710049,
    },
  },
  kovan: {
    name: 'enzymefinance/vault-balances-kovan',
    network: 'kovan',
    variables: {
      dispatcher: '0xba9493530494958EC2DeED9c8BB34004ff37Ad28',
      block: 24710049,
    },
  },
  mainnet: {
    name: 'enzymefinance/vault-balances',
    network: 'mainnet',
    variables: {
      dispatcher: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
      block: 11636493,
    },
  },
};

export const configure: Configurator<Variables> = (variables) => ({
  abis: ['@enzymefinance/protocol/artifacts/Dispatcher.json'],
  sources: [
    {
      name: 'Dispatcher',
      block: variables.block,
      address: variables.dispatcher,
      events: ['VaultProxyDeployed(indexed address,indexed address,address,indexed address,address,string)'],
    },
    {
      name: 'Asset',
      abi: 'ERC20Contract', // Inherited from global abis.
      block: variables.block,
      events: ['Transfer(indexed address,indexed address,uint256)'],
    },
  ],
});
