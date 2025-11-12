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
    deploymentId: 'QmQozUbDSgqcwgpWv5UMbA5xSbXkrsZXrPaYz2P2E4zzME',
    network: 'arbitrum-one',
    variables: {
      dispatcher: deployments.arbitrum.contracts.Dispatcher,
      weth: deployments.arbitrum.namedTokens.weth.id,
      savingsDai: '0x0000000000000000000000000000000000000000',
      start: deployments.arbitrum.deployment.inception,
    },
  },
  base: {
    name: `${name}-base`,
    deploymentId: 'QmcBa4MihRDW2PK7tZ8Y9HQrw8D8b25rg8DDqSmRtiDCUp',
    network: 'base',
    variables: {
      dispatcher: deployments.base.contracts.Dispatcher,
      weth: deployments.base.namedTokens.weth.id,
      savingsDai: '0x0000000000000000000000000000000000000000',
      start: deployments.base.deployment.inception,
    },
  },
  ethereum: {
    name,
    network: 'mainnet',
    deploymentId: 'QmYSxAAWeXDJ8DbWTy3ovv5gwsf2qHvUH8TYcU4PNZWtx3',
    variables: {
      dispatcher: deployments.ethereum.contracts.Dispatcher,
      weth: deployments.ethereum.namedTokens.weth.id,
      savingsDai: '0x83f20f44975d03b1b09e64809b757c47f942beea',
      start: deployments.ethereum.deployment.inception,
    },
  },
  polygon: {
    name: `${name}-polygon`,
    network: 'matic',
    deploymentId: 'QmV46re8LZhxhjDmdeiw7PTStF43CTUfdGRovFQ5p1WTg9',
    variables: {
      dispatcher: deployments.polygon.contracts.Dispatcher,
      weth: deployments.polygon.namedTokens.weth.id,
      savingsDai: '0x0000000000000000000000000000000000000000',
      start: deployments.polygon.deployment.inception,
    },
  },
  testnet: {
    name: `${name}-testnet`,
    deploymentId: 'QmTS4AqkepdNufxuwih4tHj452SGgHxhZdNeEcboeYNWwv',
    network: 'matic',
    variables: {
      dispatcher: deployments.testnet.contracts.Dispatcher,
      weth: deployments.testnet.namedTokens.weth.id,
      savingsDai: '0x0000000000000000000000000000000000000000',
      start: deployments.testnet.deployment.inception,
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
