import { Configurator, Contexts, DataSourceUserDeclaration, SdkUserDeclaration } from '@enzymefinance/subgraph-cli';
import { getEnvironment } from '@enzymefinance/environment/all';
import { Deployment } from '@enzymefinance/environment';

interface Variables {
  dispatcher: string;
  start: number;
}

const name = 'enzyme-vault-lineage';

export const contexts: Contexts<Variables> = {
  arbitrum: {
    name: `${name}-arbitrum`,
    network: 'arbitrum-one',
    variables: {
      dispatcher: '0xe45ae6058e637f76dea18f04154f1e6b5b21249e',
      start: 228702052,
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
