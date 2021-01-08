import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  adapterBlacklistAddress,
  adapterWhitelistAddress,
  aggregatedDerivativePriceFeedAddress,
  assetBlacklistAddress,
  assetWhitelistAddress,
  buySharesCallerWhitelistAddress,
  chainlinkPriceFeedAddress,
  comptrollerLibAddress,
  dispatcherAddress,
  feeManagerAddress,
  fundActionsWrapperAddress,
  fundDeployerAddress,
  guaranteedRedemptionAddress,
  integrationManagerAddress,
  investorWhitelistAddress,
  managementFeeAddress,
  maxConcentrationAddress,
  performanceFeeAddress,
  policyManagerAddress,
  valueInterpreterAddress,
  vaultLibAddress,
  wethTokenAddress,
} from '../addresses';
import { Contract } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useContract(id: string): Contract {
  let contract = Contract.load(id) as Contract;
  if (contract == null) {
    logCritical('Failed to load contract {}.', [id]);
  }

  return contract;
}

export function ensureContract(address: Address, name: string): Contract {
  let contract = Contract.load(address.toHex()) as Contract;
  if (contract) {
    return contract;
  }

  contract = new Contract(address.toHex());
  contract.name = name;
  contract.save();

  return contract;
}

export function registerContracts(event: ethereum.Event): void {
  let names: Array<string> = [
    'AdapterBlacklist',
    'AdapterWhitelist',
    'AggregatedDerivativePriceFeed',
    'AssetBlacklist',
    'AssetWhitelist',
    'BuySharesCallerWhitelist',
    'ChainlinkPriceFeed',
    'ComptrollerLib',
    'Dispatcher',
    'FeeManager',
    'FundActionsWrapper',
    'FundDeployer',
    'GuaranteedRedemption',
    'IntegrationManager',
    'InvestorWhitelist',
    'ManagementFee',
    'MaxConcentration',
    'PerformanceFee',
    'PolicyManager',
    'ValueInterpreter',
    'VaultLib',
    'WethToken',
  ];

  let addresses: Array<Address> = [
    adapterBlacklistAddress,
    adapterWhitelistAddress,
    aggregatedDerivativePriceFeedAddress,
    assetBlacklistAddress,
    assetWhitelistAddress,
    buySharesCallerWhitelistAddress,
    chainlinkPriceFeedAddress,
    comptrollerLibAddress,
    dispatcherAddress,
    feeManagerAddress,
    fundActionsWrapperAddress,
    fundDeployerAddress,
    guaranteedRedemptionAddress,
    integrationManagerAddress,
    investorWhitelistAddress,
    managementFeeAddress,
    maxConcentrationAddress,
    performanceFeeAddress,
    policyManagerAddress,
    valueInterpreterAddress,
    vaultLibAddress,
    wethTokenAddress,
  ];

  for (let i = 0; i < names.length; i++) {
    ensureContract(addresses[i], names[i]);
  }
}
