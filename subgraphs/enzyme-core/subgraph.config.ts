import { Configurator, Contexts, Template } from '@enzymefinance/subgraph-cli';
import { abisV2 } from './config/v2/abis';
import { sourcesV2 } from './config/v2/sources';
import { abisV3 } from './config/v3/abis';
import { sourcesV3 } from './config/v3/sources';
import { abisV4 } from './config/v4/abis';
import { sourcesV4 } from './config/v4/sources';
import { kovanContext } from './contexts/kovan';
import { mainnetContext } from './contexts/mainnet';
import { Release2Addresses, Release3Addresses, Release4Addresses } from './contexts/types';

export interface Variables {
  block: number;
  dispatcherAddress: string;
  wethTokenAddress: string;
  chainlinkAggregatorAddresses: {
    audUsd: string;
    btcEth: string;
    btcusd: string;
    chfusd: string;
    ethUsd: string;
    eurUsd: string;
    gbpUsd: string;
    jpyUsd: string;
  };
  release2: Release2Addresses;
  release3: Release3Addresses;
  release4: Release4Addresses;
}

export const contexts: Contexts<Variables> = {
  kovan: kovanContext,
  mainnet: mainnetContext,
};

export const templates: Template[] = [
  {
    template: 'templates/addresses.ts',
    destination: 'generated/addresses.ts',
  },
];

export const configure: Configurator<Variables> = (variables) => {
  const abis = [
    { name: 'Dispatcher', file: './abis/Dispatcher.json' },
    { name: 'IChainlinkAggregator', file: './abis/IChainlinkAggregator.json' },
    ...abisV2,
    ...abisV3,
    ...abisV4,
  ];

  const dispatcher = {
    name: 'Dispatcher',
    block: variables.block,
    address: variables.dispatcherAddress,
    events: [
      'VaultProxyDeployed(indexed address,indexed address,address,indexed address,address,string)',
      'CurrentFundDeployerSet(address,address)',
      'MigrationCancelled(indexed address,indexed address,indexed address,address,address,uint256)',
      'MigrationExecuted(indexed address,indexed address,indexed address,address,address,uint256)',
      'MigrationSignaled(indexed address,indexed address,indexed address,address,address,uint256)',
      'MigrationInCancelHookFailed(bytes,indexed address,indexed address,indexed address,address,address)',
      'MigrationOutHookFailed(bytes,uint8,indexed address,indexed address,indexed address,address,address)',
      'MigrationTimelockSet(uint256,uint256)',
      'NominatedOwnerRemoved(indexed address)',
      'NominatedOwnerSet(indexed address)',
      'OwnershipTransferred(indexed address,indexed address)',
      'SharesTokenSymbolSet(string)',
    ],
  };

  const releaseSources = [...sourcesV2(variables), ...sourcesV3(variables), ...sourcesV4(variables)];

  const sources = [dispatcher, ...releaseSources];
  const templates = [
    {
      name: 'VaultLib',
      version: '2',
      events: [
        'AccessorSet(address,address)',
        'Approval(indexed address,indexed address,uint256)',
        'AssetWithdrawn(indexed address,indexed address,uint256)',
        'MigratorSet(address,address)',
        'OwnerSet(address,address)',
        'TrackedAssetAdded(address)',
        'TrackedAssetRemoved(address)',
        'Transfer(indexed address,indexed address,uint256)',
        'VaultLibSet(address,address)',
      ],
    },
    {
      name: 'ComptrollerLib',
      version: '2',
      events: [
        'MigratedSharesDuePaid(uint256)',
        'OverridePauseSet(indexed bool)',
        'PreRedeemSharesHookFailed(bytes,address,uint256)',
        'SharesBought(indexed address,indexed address,uint256,uint256,uint256)',
        'SharesRedeemed(indexed address,uint256,address[],uint256[])',
        'VaultProxySet(address)',
      ],
    },
    {
      name: 'VaultLib',
      version: '3',
      events: [
        'AccessorSet(address,address)',
        'Approval(indexed address,indexed address,uint256)',
        'AssetWithdrawn(indexed address,indexed address,uint256)',
        'MigratorSet(address,address)',
        'OwnerSet(address,address)',
        'TrackedAssetAdded(address)',
        'TrackedAssetRemoved(address)',
        'Transfer(indexed address,indexed address,uint256)',
        'VaultLibSet(address,address)',
      ],
    },
    {
      name: 'ComptrollerLib',
      version: '3',
      events: [
        'MigratedSharesDuePaid(uint256)',
        'OverridePauseSet(indexed bool)',
        'PreRedeemSharesHookFailed(bytes,address,uint256)',
        'SharesBought(indexed address,indexed address,uint256,uint256,uint256)',
        'SharesRedeemed(indexed address,uint256,address[],uint256[])',
        'VaultProxySet(address)',
      ],
    },
    {
      name: 'VaultLib',
      version: '4',
      events: [
        'AccessorSet(address,address)',
        'Approval(indexed address,indexed address,uint256)',
        'AssetManagerAdded(address)',
        'AssetManagerRemoved(address)',
        'AssetWithdrawn(indexed address,indexed address,uint256)',
        'ExternalPositionAdded(indexed address)',
        'ExternalPositionRemoved(indexed address)',
        'FreelyTransferableSharesSet()',
        'MigratorSet(address,address)',
        'NominatedOwnerRemoved(indexed address)',
        'NominatedOwnerSet(indexed address)',
        'OwnerSet(address,address)',
        'OwnershipTransferred(indexed address,indexed address)',
        'ProtocolFeePaidInShares(uint256)',
        'ProtocolFeeSharesBoughtBack(uint256,uint256,uint256)',
        'TrackedAssetAdded(address)',
        'TrackedAssetRemoved(address)',
        'Transfer(indexed address,indexed address,uint256)',
        'VaultLibSet(address,address)',
      ],
    },
    {
      name: 'ComptrollerLib',
      version: '4',
      events: [
        'AutoProtocolFeeSharesBuybackSet(bool)',
        'BuyBackMaxProtocolFeeSharesFailed(bytes,uint256,uint256,uint256)',
        'DeactivateFeeManagerFailed()',
        'GasRelayPaymasterSet(address)',
        'MigratedSharesDuePaid(uint256)',
        'PayProtocolFeeDuringDestructFailed()',
        'PreRedeemSharesHookFailed(bytes,address,uint256)',
        'RedeemSharesInKindCalcGavFailed()',
        'SharesBought(indexed address,uint256,uint256,uint256)',
        'SharesRedeemed(indexed address,indexed address,uint256,address[],uint256[])',
        'VaultProxySet(address)',
      ],
    },
    {
      name: 'GasRelayPaymasterLib',
      version: '4',
      events: ['Deposited(uint256)', 'TransactionRelayed(indexed address,bytes4,bool)', 'Withdrawn(uint256)'],
    },
    {
      name: 'CompoundDebtPositionLib',
      version: '4',
      events: [
        'AssetBorrowed(indexed address,uint256)',
        'BorrowedAssetRepaid(indexed address,uint256)',
        'CollateralAssetAdded(indexed address,uint256)',
        'CollateralAssetRemoved(indexed address,uint256)',
      ],
    },
  ];

  return { abis, sources, templates };
};
