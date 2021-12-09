import {
  Configurator,
  Contexts,
  DataSourceTemplateUserDeclaration,
  DataSourceUserDeclaration,
  SdkUserDeclaration,
  Template,
} from '@enzymefinance/subgraph-cli';
import { default as local } from '../../deployments/local/v4.json';
import { default as matic } from '../../deployments/matic/v4.json';

interface Variables {
  dispatcher: string;
  weth: string;
  start: number;
}

const name = 'enzymefinance/vault-balances';

export const contexts: Contexts<Variables> = {
  kovan: {
    name: `${name}-kovan`,
    network: 'kovan',
    variables: {
      dispatcher: '0xCdb7a704a3aB0C88651F0466d2Ec01c3db5EbF66',
      weth: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      start: 27529642,
    },
  },
  mainnet: {
    name,
    network: 'mainnet',
    variables: {
      dispatcher: matic.contracts.Dispatcher.address,
      weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      start: 11681281,
    },
  },
  matic: {
    name: `${name}-matic`,
    network: 'matic',
    variables: {
      dispatcher: '0x402A81aD2972a017B4564453E69afaE2b006A7E2',
      weth: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      start: 22327337,
    },
  },
  local: {
    local: true,
    name,
    network: 'local',
    variables: {
      dispatcher: local.contracts.Dispatcher.address,
      weth: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      start: 13619920,
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
