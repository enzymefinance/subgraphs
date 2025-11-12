import { Configurator, Contexts, DataSourceUserDeclaration, SdkUserDeclaration } from '@enzymefinance/subgraph-cli';
import { getEnvironment } from '@enzymefinance/environment/deployments/all';
import { Deployment } from '@enzymefinance/environment';

interface Variables {
  dispatcher: string;
  start: number;
}

const name = 'enzyme-vault-lineage';

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
    deploymentId: 'QmbXjfoaBn2VVKYcs3Zb29ZK8bBWTEdKgeKLAFeDv33DKW',
    network: 'arbitrum-one',
    variables: {
      dispatcher: deployments.arbitrum.contracts.Dispatcher,
      start: deployments.arbitrum.deployment.inception,
    },
  },
  base: {
    name: `${name}-base`,
    deploymentId: 'QmbRXUwbi5PuyHnMAfYJoJnosB7JZ7ZBAjxS7RHgonECcm',
    network: 'base',
    variables: {
      dispatcher: deployments.base.contracts.Dispatcher,
      start: deployments.base.deployment.inception,
    },
  },
  ethereum: {
    name,
    deploymentId: 'QmQvWjkGqnAk1YBfSogasskPhJ5dG46yxvrzYeJsowjhqb',
    network: 'mainnet',
    variables: {
      dispatcher: deployments.ethereum.contracts.Dispatcher,
      start: deployments.ethereum.deployment.inception,
    },
  },
  polygon: {
    name: `${name}-polygon`,
    deploymentId: 'QmYyV5mynEQ3RV6oEtPupQWryFtHVjhtBzY8pLTZ5ruKs2',
    network: 'matic',
    variables: {
      dispatcher: deployments.polygon.contracts.Dispatcher,
      start: deployments.polygon.deployment.inception,
    },
  },
  testnet: {
    name: `${name}-testnet`,
    deploymentId: 'QmQmA4tAyiMPvRLNmbkmm5eQYnxwB8yTRZDv4z78tMyaZr',
    network: 'matic',
    variables: {
      dispatcher: deployments.testnet.contracts.Dispatcher,
      start: deployments.testnet.deployment.inception,
    },
  },
};

export const configure: Configurator<Variables> = (variables) => {
  const sdks: SdkUserDeclaration[] = [
    {
      name: 'VaultLib',
      abis: {
        VaultLib: 'abis/VaultLib.json',
      },
      functions: (abis) => [abis.VaultLib.getFunction('symbol')],
    },
  ];

  const sources: DataSourceUserDeclaration[] = [
    {
      name: 'Dispatcher',
      block: variables.start,
      address: variables.dispatcher,
      events: (abi) => [
        abi.getEvent('VaultProxyDeployed'),
        abi.getEvent('MigrationExecuted'),
        abi.getEvent('CurrentFundDeployerSet'),
      ],
    },
  ];

  return { sources, sdks };
};
