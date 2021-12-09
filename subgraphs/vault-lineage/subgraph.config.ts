import { Configurator, Contexts, DataSourceUserDeclaration } from '@enzymefinance/subgraph-cli';
import { default as v4 } from '../../deployments/local/v4.json';

interface Variables {
  dispatcher: string;
  start: number;
}

const name = 'enzymefinance/vault-lineage';

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
      dispatcher: '0x402A81aD2972a017B4564453E69afaE2b006A7E2',
      start: 22327337,
    },
  },
  local: {
    local: true,
    name,
    network: 'local',
    variables: {
      dispatcher: v4.contracts.Dispatcher.address,
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
      events: (abi) => [
        abi.getEvent('VaultProxyDeployed'),
        abi.getEvent('MigrationExecuted'),
        abi.getEvent('CurrentFundDeployerSet'),
      ],
    },
  ];

  return { sources };
};
