import {
  Configurator,
  Contexts,
  DataSourceUserDeclaration,
  DataSourceTemplateUserDeclaration,
  SdkUserDeclaration,
  Template,
} from '@enzymefinance/subgraph-cli';

interface Variables {
  block: number;
  ethVault: string;
  stEthVault: string;
}

const name = 'enzymefinance/diva-staking';

const variables: Variables = {
  stEthVault: '0x1ce8aafb51e79f6bdc0ef2ebd6fd34b00620f6db',
  ethVault: '0x16770d642e882e1769ce4ac8612b8bc0601506fc',
  block: 18162907, // Creation of stETH vault (it was created before ETH vault)
};

const network = 'mainnet';

export const contexts: Contexts<Variables> = {
  ethereum: {
    name,
    network,
    variables,
  },
  [`${name}-dev`]: {
    name: `${name}-dev`,
    network,
    variables,
  },
};

export const templates: Template[] = [
  {
    template: 'templates/addresses.ts',
    destination: 'generated/addresses.ts',
  },
];

export const configure: Configurator<Variables> = (variables) => {
  const sources: DataSourceUserDeclaration[] = [
    {
      name: 'StEthVault',
      block: variables.block,
      address: variables.stEthVault,
      abi: './abis/VaultLib.json',
      events: (abi) => [abi.getEvent('AccessorSet')],
    },
    {
      name: 'EthVault',
      block: variables.block,
      address: variables.ethVault,
      abi: './abis/VaultLib.json',
      events: (abi) => [abi.getEvent('AccessorSet')],
    },
  ];

  const templates: DataSourceTemplateUserDeclaration[] = [
    { name: 'ComptrollerLib', events: (abi) => [abi.getEvent('SharesBought'), abi.getEvent('SharesRedeemed')] },
  ];

  const sdks: SdkUserDeclaration[] = [
    {
      name: 'Protocol',
      abis: {
        VaultLib: './abis/VaultLib.json',
        ComptrollerLib: './abis/ComptrollerLib.json',
      },
      functions: (abis) => [abis.VaultLib.getFunction('getAccessor'), abis.ComptrollerLib.getFunction('calcGav')],
    },
  ];

  return { sources, templates, sdks };
};
