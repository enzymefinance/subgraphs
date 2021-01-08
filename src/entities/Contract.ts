import { Address } from '@graphprotocol/graph-ts';
import {
  dispatcherAddress,
  fundDeployerAddress,
  vaultLibAddress,
  comptrollerLibAddress,
  valueInterpreterAddress,
  integrationManagerAddress,
  policyManagerAddress,
  feeManagerAddress,
  aggregatedDerivativePriceFeedAddress,
  chainlinkPriceFeedAddress,
  fundActionsWrapperAddress,
  managementFeeAddress,
  performanceFeeAddress,
  entranceRateBurnFeeAddress,
  entranceRateDirectFeeAddress,
  adapterBlacklistAddress,
  adapterWhitelistAddress,
  assetBlacklistAddress,
  assetWhitelistAddress,
  investorWhitelistAddress,
  guaranteedRedemptionAddress,
  maxConcentrationAddress,
  minMaxInvestmentAddress,
  buySharesCallerWhitelistAddress,
  trackedAssetsAdapterAddress,
  compoundAdapterAddress,
  chaiAdapterAddress,
  kyberAdapterAddress,
  uniswapV2AdapterAddress,
  paraSwapAdapterAddress,
  zeroExV2AdapterAddress,
  synthetixAdapterAddress,
  wethTokenAddress,
  chaiIntegrateeAddress,
  kyberIntegrateeAddress,
  uniswapV2IntegrateeAddress,
  synthetixIntegrateeAddress,
  synthetixAddressResolverAddress,
  synthetixDelegateApprovalsAddress,
} from '../addresses';
import { Contract } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { useNetwork } from './Network';

export function useContract(id: string, name: string): Contract {
  let contract = Contract.load(name + '/' + id) as Contract;
  if (contract == null) {
    logCritical('Failed to load contract {}.', [id]);
  }

  return contract;
}

// TODO: pass Release as a parameter
export function ensureContract(address: Address, name: string): Contract {
  let id = name + '/' + address.toHex();
  let contract = Contract.load(id) as Contract;
  if (contract) {
    return contract;
  }

  let network = useNetwork();

  contract = new Contract(id);
  contract.name = name;
  contract.release = network.currentRelease;
  contract.save();

  return contract;
}

// TODO: pass Release as a parameter
export function registerContracts(): void {
  let names: Array<string> = [
    'Dispatcher',
    'FundDeployer',
    'VaultLib',
    'ComptrollerLib',
    'ValueInterpreter',
    'IntegrationManager',
    'PolicyManager',
    'FeeManager',

    // Prices
    'AggregatedDerivativePriceFeed',
    'ChainlinkPriceFeed',

    // Peripheral
    'FundActionsWrapper',

    // Fees
    'ManagementFee',
    'PerformanceFee',
    'EntranceRateBurnFee',
    'EntranceRateDirectFee',

    // Policies
    'AdapterBlacklist',
    'AdapterWhitelist',
    'AssetBlacklist',
    'AssetWhitelist',
    'InvestorWhitelist',
    'GuaranteedRedemption',
    'MaxConcentration',
    'MinMaxInvestment',
    'BuySharesCallerWhitelist',

    // Adapters
    'TrackedAssetsAdapter',
    'CompoundAdapter',
    'ChaiAdapter',
    'KyberAdapter',
    'UniswapV2Adapter',
    'ParaSwapAdapter',
    'ZeroExV2Adapter',
    'SynthetixAdapter',

    // External
    'WethToken',
    'ChaiIntegratee',
    'KyberIntegratee',
    'UniswapV2Integratee',
    'SynthetixIntegratee',
    'SynthetixAddressResolver',
    'SynthetixDelegateApprovals',
  ];

  let addresses: Array<Address> = [
    dispatcherAddress,
    fundDeployerAddress,
    vaultLibAddress,
    comptrollerLibAddress,
    valueInterpreterAddress,
    integrationManagerAddress,
    policyManagerAddress,
    feeManagerAddress,

    // Prices
    aggregatedDerivativePriceFeedAddress,
    chainlinkPriceFeedAddress,

    // Peripheral
    fundActionsWrapperAddress,

    // Fees
    managementFeeAddress,
    performanceFeeAddress,
    entranceRateBurnFeeAddress,
    entranceRateDirectFeeAddress,

    // Policies
    adapterBlacklistAddress,
    adapterWhitelistAddress,
    assetBlacklistAddress,
    assetWhitelistAddress,
    investorWhitelistAddress,
    guaranteedRedemptionAddress,
    maxConcentrationAddress,
    minMaxInvestmentAddress,
    buySharesCallerWhitelistAddress,

    // Adapters
    trackedAssetsAdapterAddress,
    compoundAdapterAddress,
    chaiAdapterAddress,
    kyberAdapterAddress,
    uniswapV2AdapterAddress,
    paraSwapAdapterAddress,
    zeroExV2AdapterAddress,
    synthetixAdapterAddress,

    // External
    wethTokenAddress,
    chaiIntegrateeAddress,
    kyberIntegrateeAddress,
    uniswapV2IntegrateeAddress,
    synthetixIntegrateeAddress,
    synthetixAddressResolverAddress,
    synthetixDelegateApprovalsAddress,
  ];

  let network = useNetwork();

  for (let i = 0; i < names.length; i++) {
    let contract = ensureContract(addresses[i], names[i]);
    contract.release = network.currentRelease;
    contract.save();
  }
}
