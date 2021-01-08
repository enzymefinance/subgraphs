import { Address } from '@graphprotocol/graph-ts';
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
import { useNetwork } from './Network';

export function useContract(id: string): Contract {
  let contract = Contract.load(id) as Contract;
  if (contract == null) {
    logCritical('Failed to load contract {}.', [id]);
  }

  return contract;
}

// TODO: pass Release as a parameter
export function ensureContract(address: Address, name: string): Contract {
  let contract = Contract.load(address.toHex()) as Contract;
  if (contract) {
    return contract;
  }

  let network = useNetwork();

  contract = new Contract(address.toHex());
  contract.name = name;
  contract.release = network.currentRelease;
  contract.save();

  return contract;
}

// TODO: pass Release as a parameter
export function registerContracts(): void {
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

  let network = useNetwork();

  for (let i = 0; i < names.length; i++) {
    let contract = ensureContract(addresses[i], names[i]);
    contract.release = network.currentRelease;
    contract.save();
  }
}
