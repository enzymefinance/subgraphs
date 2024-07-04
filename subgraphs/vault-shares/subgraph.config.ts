import {
  Configurator,
  Contexts,
  DataSourceTemplateUserDeclaration,
  DataSourceUserDeclaration,
} from '@enzymefinance/subgraph-cli';
import { getEnvironment } from '@enzymefinance/environment/all';
import { Deployment } from '@enzymefinance/environment';

interface Variables {
  dispatcher: string;
  start: number;
}

const name = 'enzyme-vault-shares';

export const contexts: Contexts<Variables> = {
  arbitrum: {
    name,
    network: 'arbitrum-one',
    variables: {
      dispatcher: '0x0000000000000000000000000000000000000000',
      start: 1,
    },
  },
  ethereum: {
    name,
    network: 'mainnet',
    variables: {
      dispatcher: getEnvironment(Deployment.ETHEREUM).contracts.Dispatcher,
      start: 11681281,
    },
  },
  polygon: {
    name: `${name}-polygon`,
    network: 'matic',
    variables: {
      dispatcher: getEnvironment(Deployment.POLYGON).contracts.Dispatcher,
      start: 25825424,
    },
  },
  testnet: {
    name: `${name}-testnet`,
    network: 'matic',
    variables: {
      dispatcher: getEnvironment(Deployment.TESTNET).contracts.Dispatcher,
      start: 25731749,
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
