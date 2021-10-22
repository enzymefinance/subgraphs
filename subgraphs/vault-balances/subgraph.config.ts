import {
  Configurator,
  Contexts,
  DataSourceTemplateUserDeclaration,
  DataSourceUserDeclaration,
  SdkUserDeclaration,
} from '@enzymefinance/subgraph-cli';

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

export const configure: Configurator<Variables> = (variables) => {
  const sdks: SdkUserDeclaration[] = [
    {
      name: 'ERC20',
      abis: {
        ERC20: 'abis/ERC20.json',
      },
      functions: (abis) => [abis.ERC20.getFunction('decimals'), abis.ERC20.getFunction('balanceOf')],
    },
  ];

  const sources: DataSourceUserDeclaration[] = [
    {
      name: 'Dispatcher',
      block: variables.start,
      address: variables.dispatcher,
      events: (abi) => [abi.getEvent('VaultProxyDeployed')],
    },
    {
      name: 'Asset',
      abi: 'abis/ERC20.json',
      block: variables.start,
      events: (abi) => [abi.getEvent('Transfer')],
    },
  ];

  const templates: DataSourceTemplateUserDeclaration[] = [
    {
      name: 'Vault',
      events: (abi) => [abi.getEvent('TrackedAssetAdded'), abi.getEvent('TrackedAssetRemoved')],
    },
  ];

  return { sdks, sources, templates };
};
