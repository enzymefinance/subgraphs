import {
  Configurator,
  Contexts,
  DataSourceTemplateUserDeclaration,
  DataSourceUserDeclaration,
  SdkUserDeclaration,
  Template,
} from '@enzymefinance/subgraph-cli';

import { getEnvironment } from '@enzymefinance/environment/deployments/all';
import { Deployment } from '@enzymefinance/environment';

interface Variables {
  dispatcher: string;
  weth: string;
  savingsDai: string;
  start: number;
}

const name = 'enzyme-vault-balances';

const deployments = {
  arbitrum: getEnvironment(Deployment.ARBITRUM),
  base: getEnvironment(Deployment.BASE),
  ethereum: getEnvironment(Deployment.ETHEREUM),
  polygon: getEnvironment(Deployment.POLYGON),
  testnet: getEnvironment(Deployment.TESTNET),
};

export const contexts: Contexts<Variables> = {
  arbitrum: {
    name: `${name}-arbitrum`,
    network: 'arbitrum-one',
    variables: {
      dispatcher: deployments.arbitrum.contracts.Dispatcher,
      weth: deployments.arbitrum.namedTokens.weth.id,
      savingsDai: '0x0000000000000000000000000000000000000000',
      start: 230330283,
    },
  },
  base: {
    name: `${name}-base`,
    network: 'base',
    variables: {
      dispatcher: deployments.base.contracts.Dispatcher,
      weth: deployments.base.namedTokens.weth.id,
      savingsDai: '0x0000000000000000000000000000000000000000',
      start: 230330283,
    },
  },
  ethereum: {
    name,
    network: 'mainnet',
    variables: {
      dispatcher: deployments.ethereum.contracts.Dispatcher,
      weth: deployments.ethereum.namedTokens.weth.id,
      savingsDai: '0x83f20f44975d03b1b09e64809b757c47f942beea',
      start: 11681281,
    },
  },
  polygon: {
    name: `${name}-polygon`,
    network: 'matic',
    variables: {
      dispatcher: deployments.polygon.contracts.Dispatcher,
      weth: deployments.polygon.namedTokens.weth.id,
      savingsDai: '0x0000000000000000000000000000000000000000',
      start: 26191606,
    },
  },
  testnet: {
    name: `${name}-testnet`,
    network: 'matic',
    variables: {
      dispatcher: deployments.testnet.contracts.Dispatcher,
      weth: deployments.testnet.namedTokens.weth.id,
      savingsDai: '0x0000000000000000000000000000000000000000',
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
    {
      name: 'SavingsDai',
      abi: 'abis/SavingsDai.json',
      block: variables.start,
      address: variables.savingsDai,
      events: (abi) => [abi.getEvent('Deposit'), abi.getEvent('Withdraw')],
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
