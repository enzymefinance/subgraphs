import {
  Configurator,
  Contexts,
  DataSourceTemplateUserDeclaration,
  DataSourceUserDeclaration,
} from '@enzymefinance/subgraph-cli';

import polygonDevDeployment from '@enzymefinance/environment/polygon';
import polygon from '../../deployments/polygon/v4.json';

interface Variables {
  dispatcher: string;
  start: number;
}

const name = 'enzymefinance/vault-shares';

export const contexts: Contexts<Variables> = {
  ethereum: {
    name,
    network: 'mainnet',
    variables: {
      dispatcher: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
      start: 11681281,
    },
  },
  polygon: {
    name: `${name}-polygon`,
    network: 'matic',
    variables: {
      dispatcher: polygon.contracts.Dispatcher,
      start: 25825424,
    },
  },
  testnet: {
    name: `${name}-testnet`,
    network: 'matic',
    variables: {
      dispatcher: polygonDevDeployment.contracts.Dispatcher,
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
