import { Configurator, Contexts, DataSourceUserDeclaration } from '@enzymefinance/subgraph-cli';

interface Variables {
  block: number;
  vaultETH: string;
  vaultstETH: string;
}

const name = 'enzymefinance/diva';

const variables: Variables = {
  vaultstETH: '0x1ce8aafb51e79f6bdc0ef2ebd6fd34b00620f6db',
  vaultETH: '0x16770d642e882e1769ce4ac8612b8bc0601506fc',
  block: 18162907, // Creation of stETH vault (it was create before ETH vault)
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

export const configure: Configurator<Variables> = (variables) => {
  const sources: DataSourceUserDeclaration[] = [
    {
      name: 'VaultstETH',
      block: variables.block,
      address: variables.vaultstETH,
      events: (abi) => [abi.getEvent('AccessorSet')],
    },
    {
      name: 'VaultETH',
      block: variables.block,
      address: variables.vaultETH,
      events: (abi) => [abi.getEvent('AccessorSet')],
    },
  ];

  return { sources };
};
