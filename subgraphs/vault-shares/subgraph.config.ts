import {
  Configurator,
  Contexts,
  DataSourceTemplateUserDeclaration,
  DataSourceUserDeclaration,
} from '@enzymefinance/subgraph-cli';
import { default as v4Local } from '../../deployments/local/v4.json';

import polygon from '@enzymefinance/environment/polygon';
import polygonDev from '../../deployments/matic-dev/v4.json';

interface Variables {
  dispatcher: string;
  start: number;
}

const name = 'enzymefinance/vault-shares';

export const contexts: Contexts<Variables> = {
  kovan: {
    name: `${name}-kovan`,
    network: 'kovan',
    variables: {
      dispatcher: '0xb5f802D8e7d4c8aCD51e7097fAA03F286e90609d',
      start: 27217130,
    },
  },
  mainnet: {
    name,
    network: 'mainnet',
    variables: {
      dispatcher: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
      start: 11681281,
    },
  },
  matic: {
    name: `${name}-matic`,
    network: 'matic',
    variables: {
      dispatcher: polygon.contracts.Dispatcher,
      start: 25731749,
    },
  },
  'matic-dev': {
    name: `${name}-matic-dev`,
    network: 'matic',
    variables: {
      dispatcher: polygonDev.contracts.Dispatcher,
      start: 25825424,
    },
  },
  local: {
    local: true,
    name,
    network: 'local',
    variables: {
      dispatcher: v4Local.contracts.Dispatcher.address,
      start: 13619920,
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
