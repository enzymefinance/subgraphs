import { Configurator, Contexts, Template } from '@enzymefinance/subgraph-cli';
import { kovanContext } from './contexts/kovan';
import { localMainnetContext } from './contexts/local-mainnet';
import { mainnetContext } from './contexts/mainnet';
import { ReleaseAddresses } from './contexts/types';

export interface Variables {
  block: number;
  dispatcherAddress: string;
  releaseA: ReleaseAddresses;
  releaseB: ReleaseAddresses;
}

export const contexts: Contexts<Variables> = {
  localMainnet: localMainnetContext,
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
    '@enzymefinance/enzyme-core-subgraph/utils/abis/CurveRegistry.json',
    '@enzymefinance/protocol/artifacts/AavePriceFeed.json',
    '@enzymefinance/protocol/artifacts/AdapterBlacklist.json',
    '@enzymefinance/protocol/artifacts/AdapterWhitelist.json',
    '@enzymefinance/protocol/artifacts/AggregatedDerivativePriceFeed.json',
    '@enzymefinance/protocol/artifacts/AlphaHomoraV1PriceFeed.json',
    '@enzymefinance/protocol/artifacts/AssetBlacklist.json',
    '@enzymefinance/protocol/artifacts/AssetWhitelist.json',
    '@enzymefinance/protocol/artifacts/BuySharesCallerWhitelist.json',
    '@enzymefinance/protocol/artifacts/ChainlinkPriceFeed.json',
    '@enzymefinance/protocol/artifacts/ChaiPriceFeed.json',
    '@enzymefinance/protocol/artifacts/CompoundAdapter.json',
    '@enzymefinance/protocol/artifacts/CompoundPriceFeed.json',
    '@enzymefinance/protocol/artifacts/ComptrollerLib.json',
    '@enzymefinance/protocol/artifacts/CurvePriceFeed.json',
    '@enzymefinance/protocol/artifacts/Dispatcher.json',
    '@enzymefinance/protocol/artifacts/EntranceRateBurnFee.json',
    '@enzymefinance/protocol/artifacts/EntranceRateDirectFee.json',
    '@enzymefinance/protocol/artifacts/FeeManager.json',
    '@enzymefinance/protocol/artifacts/FundActionsWrapper.json',
    '@enzymefinance/protocol/artifacts/FundDeployer.json',
    '@enzymefinance/protocol/artifacts/GuaranteedRedemption.json',
    '@enzymefinance/protocol/artifacts/ICERC20.json',
    '@enzymefinance/protocol/artifacts/IChainlinkAggregator.json',
    '@enzymefinance/protocol/artifacts/ICurveAddressProvider.json',
    '@enzymefinance/protocol/artifacts/IdlePriceFeed.json',
    '@enzymefinance/protocol/artifacts/IntegrationManager.json',
    '@enzymefinance/protocol/artifacts/InvestorWhitelist.json',
    '@enzymefinance/protocol/artifacts/IUniswapV2Pair.json',
    '@enzymefinance/protocol/artifacts/IUniswapV2Pair.json',
    '@enzymefinance/protocol/artifacts/ManagementFee.json',
    '@enzymefinance/protocol/artifacts/MaxConcentration.json',
    '@enzymefinance/protocol/artifacts/MinMaxInvestment.json',
    '@enzymefinance/protocol/artifacts/PerformanceFee.json',
    '@enzymefinance/protocol/artifacts/PolicyManager.json',
    '@enzymefinance/protocol/artifacts/StakehoundEthPriceFeed.json',
    '@enzymefinance/protocol/artifacts/SynthetixPriceFeed.json',
    '@enzymefinance/protocol/artifacts/UniswapV2PoolPriceFeed.json',
    '@enzymefinance/protocol/artifacts/ValueInterpreter.json',
    '@enzymefinance/protocol/artifacts/VaultLib.json',
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

  const releases = [variables.releaseA, variables.releaseB].map((release) => [
    {
      name: 'FundDeployer',
      block: variables.block,
      address: release.fundDeployerAddress,
      events: [
        'ComptrollerLibSet(address)',
        'ComptrollerProxyDeployed(indexed address,address,indexed address,uint256,bytes,bytes,indexed bool)',
        'NewFundCreated(indexed address,address,address,indexed address,string,indexed address,uint256,bytes,bytes)',
        'ReleaseStatusSet(indexed uint8,indexed uint8)',
        'VaultCallDeregistered(indexed address,bytes4)',
        'VaultCallRegistered(indexed address,bytes4)',
      ],
    },
    {
      name: 'FeeManager',
      block: variables.block,
      address: release.feeManagerAddress,
      events: [
        'AllSharesOutstandingForcePaidForFund(indexed address,address,uint256)',
        'FeeDeregistered(indexed address,indexed string)',
        'FeeEnabledForFund(indexed address,indexed address,bytes)',
        'FeeRegistered(indexed address,indexed string,uint8[],uint8[],bool,bool)',
        'FeeSettledForFund(indexed address,indexed address,indexed uint8,address,address,uint256)',
        'FeesRecipientSetForFund(indexed address,address,address)',
        'SharesOutstandingPaidForFund(indexed address,indexed address,uint256)',
      ],
    },
    {
      name: 'EntranceRateDirectFee',
      block: variables.block,
      address: release.entranceRateDirectFeeAddress,
      events: ['FundSettingsAdded(indexed address,uint256)', 'Settled(indexed address,indexed address,uint256)'],
    },
    {
      name: 'EntranceRateBurnFee',
      block: variables.block,
      address: release.entranceRateBurnFeeAddress,
      events: ['FundSettingsAdded(indexed address,uint256)', 'Settled(indexed address,indexed address,uint256)'],
    },
    {
      name: 'ManagementFee',
      block: variables.block,
      address: release.managementFeeAddress,
      events: ['FundSettingsAdded(indexed address,uint256)', 'Settled(indexed address,uint256,uint256)'],
    },
    {
      name: 'PerformanceFee',
      block: variables.block,
      address: release.performanceFeeAddress,
      events: [
        'ActivatedForFund(indexed address,uint256)',
        'FundSettingsAdded(indexed address,uint256,uint256)',
        'LastSharePriceUpdated(indexed address,uint256,uint256)',
        'PaidOut(indexed address,uint256,uint256,uint256)',
        'PerformanceUpdated(indexed address,uint256,uint256,int256)',
      ],
    },
    {
      name: 'IntegrationManager',
      block: variables.block,
      address: release.integrationManagerAddress,
      events: [
        'AdapterDeregistered(indexed address,indexed string)',
        'AdapterRegistered(indexed address,indexed string)',
        'AuthUserAddedForFund(indexed address,indexed address)',
        'AuthUserRemovedForFund(indexed address,indexed address)',
        'CallOnIntegrationExecutedForFund(indexed address,address,address,indexed address,indexed bytes4,bytes,address[],uint256[],address[],uint256[])',
      ],
    },
    {
      name: 'PolicyManager',
      block: variables.block,
      address: release.policyManagerAddress,
      events: [
        'PolicyDeregistered(indexed address,indexed string)',
        'PolicyDisabledForFund(indexed address,indexed address)',
        'PolicyEnabledForFund(indexed address,indexed address,bytes)',
        'PolicyRegistered(indexed address,indexed string,uint8[])',
      ],
    },
    {
      name: 'AdapterBlacklist',
      block: variables.block,
      address: release.adapterBlacklistAddress,
      events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
    },
    {
      name: 'AdapterWhitelist',
      block: variables.block,
      address: release.adapterWhitelistAddress,
      events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
    },
    {
      name: 'AssetBlacklist',
      block: variables.block,
      address: release.assetBlacklistAddress,
      events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
    },
    {
      name: 'AssetWhitelist',
      block: variables.block,
      address: release.assetWhitelistAddress,
      events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
    },
    {
      name: 'BuySharesCallerWhitelist',
      block: variables.block,
      address: release.buySharesCallerWhitelistAddress,
      events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
    },
    {
      name: 'GuaranteedRedemption',
      block: variables.block,
      address: release.guaranteedRedemptionAddress,
      events: [
        'AdapterAdded(address)',
        'AdapterRemoved(address)',
        'FundSettingsSet(indexed address,uint256,uint256)',
        'RedemptionWindowBufferSet(uint256,uint256)',
      ],
    },
    {
      name: 'InvestorWhitelist',
      block: variables.block,
      address: release.investorWhitelistAddress,
      events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
    },
    {
      name: 'MaxConcentration',
      block: variables.block,
      address: release.maxConcentrationAddress,
      events: ['MaxConcentrationSet(indexed address,uint256)'],
    },
    {
      name: 'MinMaxInvestment',
      block: variables.block,
      address: release.minMaxInvestmentAddress,
      events: ['FundSettingsSet(indexed address,uint256,uint256)'],
    },
    {
      name: 'AggregatedDerivativePriceFeed',
      block: variables.block,
      address: release.aggregatedDerivativePriceFeedAddress,
      events: [
        'DerivativeAdded(indexed address,address)',
        'DerivativeRemoved(indexed address)',
        'DerivativeUpdated(indexed address,address,address)',
      ],
    },
    {
      name: 'ChainlinkPriceFeed',
      block: variables.block,
      address: release.chainlinkPriceFeedAddress,
      events: [
        'EthUsdAggregatorSet(address,address)',
        'PrimitiveAdded(indexed address,address,uint8,uint256)',
        'PrimitiveRemoved(indexed address)',
        'PrimitiveUpdated(indexed address,address,address)',
      ],
    },
  ]);

  // @ts-ignore
  const flattened = releases.flatMap((release, index) => release.map((source) => ({ ...source, version: index })));
  const sources = [dispatcher, ...flattened];
  const templates = [
    {
      name: 'VaultLib',
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
      events: [
        'MigratedSharesDuePaid(uint256)',
        'OverridePauseSet(indexed bool)',
        'PreRedeemSharesHookFailed(bytes,address,uint256)',
        'SharesBought(indexed address,indexed address,uint256,uint256,uint256)',
        'SharesRedeemed(indexed address,uint256,address[],uint256[])',
        'VaultProxySet(address)',
      ],
    },
  ];

  return { abis, sources, templates };
};
