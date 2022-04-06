import {
  Configurator,
  Contexts,
  DataSourceTemplateUserDeclaration,
  DataSourceUserDeclaration,
  SdkUserDeclaration,
  Template,
} from '@enzymefinance/subgraph-cli';

import ethereumDeployment from '@enzymefinance/environment/ethereum';
import polygonDevDeployment from '@enzymefinance/environment/polygon';
import polygonDeployment from '../../deployments/polygon/v4.json';

interface Variables {
  dispatcher: string;
  weth: string;
  start: number;
}

const name = 'enzymefinance/vault-balances';

export const contexts: Contexts<Variables> = {
  ethereum: {
    name,
    network: 'mainnet',
    variables: {
      dispatcher: ethereumDeployment.contracts.Dispatcher,
      weth: ethereumDeployment.weth.id,
      start: 11681281,
    },
  },
  polygon: {
    name: `${name}-polygon`,
    network: 'matic',
    variables: {
      dispatcher: polygonDeployment.contracts.Dispatcher,
      weth: polygonDevDeployment.weth.id,
      start: 26191606,
    },
  },
  testnet: {
    name: `${name}-testnet`,
    network: 'matic',
    variables: {
      dispatcher: polygonDevDeployment.contracts.Dispatcher,
      weth: polygonDevDeployment.weth.id,
      start: 25731749,
    },
  },
};

export const templates: Template[] = [
  {
    template: 'templates/addresses.ts',
    destination: 'generated/addresses.ts',
  },
];

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
      events: (abi) => [
        abi.getEvent('TrackedAssetAdded'),
        abi.getEvent('TrackedAssetRemoved'),
        abi.getEvent('EthReceived'),
      ],
    },
  ];

  return { sdks, sources, templates };
};
