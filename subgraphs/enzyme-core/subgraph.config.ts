import {
  Configurator,
  Contexts,
  DataSourceTemplateUserDeclaration,
  DataSourceUserDeclaration,
  SdkUserDeclaration,
  Template,
} from '@enzymefinance/subgraph-cli';
import * as v2 from './config/v2';
import * as v3 from './config/v3';
import * as v4 from './config/v4';
import { kovan } from './contexts/kovan';
import { local } from './contexts/local';
import { mainnet } from './contexts/mainnet';
import { matic } from './contexts/matic';
import { rinkeby } from './contexts/rinkeby';

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
  releases: {
    v2: v2.ReleaseVariables;
    v3: v3.ReleaseVariables;
    v4: v4.ReleaseVariables;
  };
}

export const contexts: Contexts<Variables> = {
  kovan,
  mainnet,
  matic,
  rinkeby,
  local,
};

export const templates: Template[] = [
  {
    template: 'templates/addresses.ts',
    destination: 'generated/addresses.ts',
  },
];

export const configure: Configurator<Variables> = (variables) => {
  const dispatcher: DataSourceUserDeclaration = {
    name: 'Dispatcher',
    block: variables.block,
    address: variables.dispatcherAddress,
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
  };

  const sdks: SdkUserDeclaration[] = [
    {
      name: 'Protocol',
      abis: {
        ChainlinkAggregator: 'abis/ChainlinkAggregator.json',
        Dispatcher: 'abis/Dispatcher.json',
        ValueInterpreterA: 'abis/v2/ValueInterpreter.json',
        ValueInterpreterB: 'abis/v4/ValueInterpreter.json',
        VaultLib: 'abis/v4/VaultLib.json',
        ComptrollerLibA: 'abis/v2/ComptrollerLib.json',
        ComptrollerLibB: 'abis/v4/ComptrollerLib.json',
        CompoundDebtPositionLib: 'abis/v4/CompoundDebtPositionLib.json',
        GasRelayPaymasterLib: 'abis/v4/GasRelayPaymasterLib.json',
        ProtocolFeeTracker: 'abis/v4/ProtocolFeeTracker.json',
        OnlyUntrackDustOrPricelessAssetsPolicy: 'abis/v4/OnlyUntrackDustOrPricelessAssetsPolicy.json',
      },
      functions: (abis) => [
        abis.ChainlinkAggregator.getFunction('latestAnswer'),
        abis.ChainlinkAggregator.getFunction('latestTimestamp'),
        abis.Dispatcher.getFunction('getMigrationTimelock'),
        abis.Dispatcher.getFunction('getSharesTokenSymbol'),
        abis.Dispatcher.getFunction('getOwner'),
        abis.Dispatcher.getFunction('getNominatedOwner'),
        abis.ValueInterpreterA.getFunction('calcCanonicalAssetValue'),
        abis.ValueInterpreterB.getFunction('calcCanonicalAssetValue'),
        abis.VaultLib.getFunction('name'),
        abis.VaultLib.getFunction('getProtocolFeeTracker'),
        abis.VaultLib.getFunction('balanceOf'),
        abis.VaultLib.getFunction('totalSupply'),
        abis.ComptrollerLibA.getFunction('calcGav'),
        abis.ComptrollerLibB.getFunction('calcGav'),
        abis.ComptrollerLibA.getFunction('calcGrossShareValue'),
        abis.ComptrollerLibB.getFunction('calcGrossShareValue'),
        abis.ComptrollerLibA.getFunction('getDenominationAsset'),
        abis.CompoundDebtPositionLib.getFunction('getManagedAssets'),
        abis.CompoundDebtPositionLib.getFunction('getDebtAssets'),
        abis.GasRelayPaymasterLib.getFunction('getParentComptroller'),
        abis.GasRelayPaymasterLib.getFunction('getRelayHubDeposit'),
        abis.ProtocolFeeTracker.getFunction('getFeeBpsForVault'),
        abis.OnlyUntrackDustOrPricelessAssetsPolicy.getFunction('getFundDeployer'),
      ],
    },
    {
      name: 'ERC20',
      abis: {
        ERC20: 'abis/ERC20.json',
      },
      functions: (abis) => [
        abis.ERC20.getFunction('totalSupply'),
        abis.ERC20.getFunction('allowance'),
        abis.ERC20.getFunction('balanceOf'),
        abis.ERC20.getFunction('decimals'),
        abis.ERC20.getFunction('symbol'),
        abis.ERC20.getFunction('name'),
      ],
    },
    {
      name: 'ERC20Bytes',
      abis: {
        ERC20Bytes: 'abis/ERC20Bytes.json',
      },
      functions: (abis) => [abis.ERC20Bytes.getFunction('symbol'), abis.ERC20Bytes.getFunction('name')],
    },
  ];

  const sources: DataSourceUserDeclaration[] = [
    dispatcher,
    ...v2.sources(variables.releases.v2).map((item) => ({ ...item, version: 2, block: variables.block })),
    ...v3.sources(variables.releases.v3).map((item) => ({ ...item, version: 3, block: variables.block })),
    ...v4.sources(variables.releases.v4).map((item) => ({ ...item, version: 4, block: variables.block })),
  ];

  const templates: DataSourceTemplateUserDeclaration[] = [
    ...v2.templates.map((item) => ({ ...item, version: 2 })),
    ...v3.templates.map((item) => ({ ...item, version: 3 })),
    ...v4.templates.map((item) => ({ ...item, version: 4 })),
  ];

  return {
    sdks,
    templates,
    sources: [...sources],
  };
};
