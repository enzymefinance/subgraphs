import { DataSourceTemplateUserDeclaration, DataSourceUserDeclaration } from '@enzymefinance/subgraph-cli';

export interface ReleaseVariables {
  adapterBlacklistAddress: string;
  adapterWhitelistAddress: string;
  aggregatedDerivativePriceFeedAddress: string;
  assetBlacklistAddress: string;
  assetWhitelistAddress: string;
  buySharesCallerWhitelistAddress: string;
  chainlinkPriceFeedAddress: string;
  comptrollerLibAddress: string;
  entranceRateBurnFeeAddress: string;
  entranceRateDirectFeeAddress: string;
  feeManagerAddress: string;
  fundActionsWrapperAddress: string;
  fundDeployerAddress: string;
  guaranteedRedemptionAddress: string;
  integrationManagerAddress: string;
  investorWhitelistAddress: string;
  managementFeeAddress: string;
  maxConcentrationAddress: string;
  minMaxInvestmentAddress: string;
  performanceFeeAddress: string;
  policyManagerAddress: string;
  valueInterpreterAddress: string;
  vaultLibAddress: string;
}

export const sources = (variables: ReleaseVariables): DataSourceUserDeclaration[] => [
  {
    name: 'FundDeployer',
    address: variables.fundDeployerAddress,
  },
  {
    name: 'FeeManager',
    address: variables.feeManagerAddress,
  },
  {
    name: 'EntranceRateDirectFee',
    address: variables.entranceRateDirectFeeAddress,
  },
  {
    name: 'EntranceRateBurnFee',
    address: variables.entranceRateBurnFeeAddress,
  },
  {
    name: 'ManagementFee',
    address: variables.managementFeeAddress,
  },
  {
    name: 'PerformanceFee',
    address: variables.performanceFeeAddress,
  },
  {
    name: 'IntegrationManager',
    address: variables.integrationManagerAddress,
  },
  {
    name: 'PolicyManager',
    address: variables.policyManagerAddress,
  },
  {
    name: 'AdapterBlacklist',
    address: variables.adapterBlacklistAddress,
  },
  {
    name: 'AdapterWhitelist',
    address: variables.adapterWhitelistAddress,
  },
  {
    name: 'AssetBlacklist',
    address: variables.assetBlacklistAddress,
  },
  {
    name: 'AssetWhitelist',
    address: variables.assetWhitelistAddress,
  },
  {
    name: 'BuySharesCallerWhitelist',
    address: variables.buySharesCallerWhitelistAddress,
  },
  {
    name: 'GuaranteedRedemption',
    address: variables.guaranteedRedemptionAddress,
  },
  {
    name: 'InvestorWhitelist',
    address: variables.investorWhitelistAddress,
  },
  {
    name: 'MaxConcentration',
    address: variables.maxConcentrationAddress,
  },
  {
    name: 'MinMaxInvestment',
    address: variables.minMaxInvestmentAddress,
  },
  {
    name: 'AggregatedDerivativePriceFeed',
    address: variables.aggregatedDerivativePriceFeedAddress,
  },
  {
    name: 'ChainlinkPriceFeed',
    address: variables.chainlinkPriceFeedAddress,
  },
];

export const templates: DataSourceTemplateUserDeclaration[] = [
  {
    name: 'VaultLib',
  },
  {
    name: 'ComptrollerLib',
  },
];
