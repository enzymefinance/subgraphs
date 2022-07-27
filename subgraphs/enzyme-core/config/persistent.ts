import { DataSourceTemplateUserDeclaration, DataSourceUserDeclaration } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';

export const sources = (variables: Variables): DataSourceUserDeclaration[] => {
  return [
    {
      name: 'Dispatcher',
      block: variables.block,
      address: variables.persistent.dispatcherAddress,
      events: (abi) => [
        abi.getEvent('VaultProxyDeployed'),
        abi.getEvent('MigrationExecuted'),
        abi.getEvent('CurrentFundDeployerSet'),
        abi.getEvent('MigrationCancelled'),
        abi.getEvent('MigrationSignaled'),
        abi.getEvent('MigrationTimelockSet'),
        abi.getEvent('NominatedOwnerSet'),
        abi.getEvent('NominatedOwnerRemoved'),
        abi.getEvent('OwnershipTransferred'),
        abi.getEvent('MigrationInCancelHookFailed'),
        abi.getEvent('MigrationInCancelHookFailed'),
        abi.getEvent('MigrationOutHookFailed'),
        abi.getEvent('SharesTokenSymbolSet'),
      ],
    },
    {
      name: 'ExternalPositionFactory',
      block: variables.block,
      address: variables.persistent.externalPositionFactoryAddress,
      events: (abi) => [
        abi.getEvent('PositionDeployed'),
        abi.getEvent('PositionDeployerAdded'),
        abi.getEvent('PositionDeployerRemoved'),
        abi.getEvent('PositionTypeAdded'),
        abi.getEvent('PositionTypeLabelUpdated'),
      ],
    },
    {
      name: 'SharesSplitterFactory',
      block: variables.block,
      address: variables.persistent.sharesSplitterFactoryAddress,
      events: (abi) => [abi.getEvent('ProxyDeployed')],
    },
  ];
};

export const templates: DataSourceTemplateUserDeclaration[] = [{ name: 'SharesSplitterLib' }];
