import { Configurator, Contexts } from '@enzymefinance/subgraph-cli';

interface Variables {
  dispatcher: string;
  dispatcherBlock: number;
  firstVaultBlock: number;
}

const name = 'enzymefinance/vault-balances';

export const contexts: Contexts<Variables> = {
  kovan: {
    name: `${name}-kovan`,
    network: 'kovan',
    variables: {
      dispatcher: '0xba9493530494958EC2DeED9c8BB34004ff37Ad28',
      dispatcherBlock: 24710049,
      firstVaultBlock: 24710049,
    },
  },
  mainnet: {
    name,
    network: 'mainnet',
    variables: {
      dispatcher: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
      dispatcherBlock: 11636493,
      firstVaultBlock: 11681281,
    },
  },
  local: {
    local: true,
    name,
    network: 'kovan',
    variables: {
      dispatcher: '0xba9493530494958EC2DeED9c8BB34004ff37Ad28',
      dispatcherBlock: 24710049,
      firstVaultBlock: 24710049,
    },
  },
};

export const configure: Configurator<Variables> = (variables) => ({
  abis: ['./abis/Dispatcher.json', './abis/AssetTrackingVault.json'],
  sources: [
    {
      name: 'Dispatcher',
      block: variables.dispatcherBlock,
      address: variables.dispatcher,
      events: ['VaultProxyDeployed(indexed address,indexed address,address,indexed address,address,string)'],
    },
    {
      name: 'Asset',
      abi: 'ERC20Contract', // Inherited from global abis.
      block: variables.firstVaultBlock,
      events: ['Transfer(indexed address,indexed address,uint256)'],
    },
  ],
  templates: [
    {
      name: 'Vault',
      abi: 'AssetTrackingVaultContract',
      events: [
        'ExternalPositionAdded(indexed address)',
        'ExternalPositionRemoved(indexed address)',
        'TrackedAssetAdded(address)',
        'TrackedAssetAdded(indexed address)',
        'TrackedAssetRemoved(address)',
        'TrackedAssetRemoved(indexed address)',
      ],
    },
  ],
});
