import {
  Configurator,
  Contexts,
  DataSourceTemplateUserDeclaration,
  DataSourceUserDeclaration,
} from '@enzymefinance/subgraph-cli';
import { getEnvironment } from '@enzymefinance/environment/deployments/all';
import { Deployment } from '@enzymefinance/environment';

interface Variables {
  dispatcher: string;
  start: number;
}

const name = 'enzyme-vault-shares';

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
      start: deployments.arbitrum.deployment.inception,
    },
  },
  base: {
    name: `${name}-base`,
    network: 'base',
    variables: {
      dispatcher: deployments.base.contracts.Dispatcher,
      start: deployments.base.deployment.inception,
    },
  },
  ethereum: {
    name,
    network: 'mainnet',
    variables: {
      dispatcher: deployments.ethereum.contracts.Dispatcher,
      start: deployments.ethereum.deployment.inception,
    },
  },
  polygon: {
    name: `${name}-polygon`,
    network: 'matic',
    variables: {
      dispatcher: deployments.polygon.contracts.Dispatcher,
      start: deployments.polygon.deployment.inception,
    },
  },
  testnet: {
    name: `${name}-testnet`,
    network: 'matic',
    variables: {
      dispatcher: deployments.testnet.contracts.Dispatcher,
      start: deployments.testnet.deployment.inception,
    },
  },
};

export const configure: Configurator<Variables> = (variables) => {
  const sources: DataSourceUserDeclaration[] = [
    {
      name: 'Dispatcher',
      block: variables.start,
      address: variables.dispatcher,
      events: (abi) => [abi.getEvent('VaultProxyDeployed')],
    },
  ];

  const templates: DataSourceTemplateUserDeclaration[] = [
    {
      name: 'Vault',
      events: (abi) => [abi.getEvent('Transfer')],
    },
  ];

  return { sources, templates };
};
