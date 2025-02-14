import { DataSourceTemplateUserDeclaration, DataSourceUserDeclaration } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';

export const sources = (variables: Variables): DataSourceUserDeclaration[] => {
  return [
    { name: 'AddressListRegistry', block: variables.block, address: variables.persistent.addressListRegistryAddress },
    {
      name: 'Dispatcher',
      block: variables.block,
      address: variables.persistent.dispatcherAddress,
    },
    {
      name: 'ExternalPositionFactory',
      block: variables.block,
      address: variables.persistent.externalPositionFactoryAddress,
    },
    {
      name: 'GatedRedemptionQueueSharesWrapperFactory',
      block: variables.block,
      address: variables.persistent.gatedRedemptionQueueSharesWrapperFactoryAddress,
    },
    {
      name: 'ManualValueOracleFactory',
      block: variables.block,
      address: variables.persistent.manualValueOracleFactoryAddress,
    },
    {
      name: 'PendleMarketsRegistry',
      block: variables.block,
      address: variables.persistent.pendleMarketsRegistryAddress,
    },
    {
      name: 'ProtocolFeeReserveLib',
      block: variables.block,
      address: variables.persistent.protocolFeeReserveLibAddress,
    },
    {
      name: 'SharesSplitterFactory',
      block: variables.block,
      address: variables.persistent.sharesSplitterFactoryAddress,
    },
    {
      name: 'SingleAssetRedemptionQueueFactory',
      block: variables.block,
      address: variables.persistent.singleAssetRedemptionQueueFactoryAddress,
    },
    {
      name: 'DispatcherOwnedBeaconFactory',
      block: variables.block,
      address: variables.persistent.singleAssetDepositQueueFactoryAddress,
    },
    { name: 'UintListRegistry', block: variables.block, address: variables.persistent.uintListRegistryAddress },
  ];
};

export const templates: DataSourceTemplateUserDeclaration[] = [
  { name: 'GatedRedemptionQueueSharesWrapperLib' },
  { name: 'ManualValueOracleLib' },
  { name: 'SharesSplitterLib' },
  { name: 'SingleAssetRedemptionQueueLib' },
  { name: 'SingleAssetDepositQueueLib' },
];
