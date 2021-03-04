import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  adapterBlacklistAddress,
  adapterWhitelistAddress,
  aggregatedDerivativePriceFeedAddress,
  assetBlacklistAddress,
  assetWhitelistAddress,
  authUserExecutedSharesRequestorFactoryAddress,
  buySharesCallerWhitelistAddress,
  chaiAdapterAddress,
  chaiIntegrateeAddress,
  chainlinkPriceFeedAddress,
  compoundAdapterAddress,
  comptrollerLibAddress,
  dispatcherAddress,
  entranceRateBurnFeeAddress,
  entranceRateDirectFeeAddress,
  feeManagerAddress,
  fundActionsWrapperAddress,
  fundDeployerAddress,
  guaranteedRedemptionAddress,
  integrationManagerAddress,
  investorWhitelistAddress,
  kyberAdapterAddress,
  kyberIntegrateeAddress,
  managementFeeAddress,
  maxConcentrationAddress,
  minMaxInvestmentAddress,
  paraSwapAdapterAddress,
  performanceFeeAddress,
  policyManagerAddress,
  synthetixAdapterAddress,
  synthetixAddressResolverAddress,
  synthetixDelegateApprovalsAddress,
  synthetixIntegrateeAddress,
  trackedAssetsAdapterAddress,
  uniswapV2AdapterAddress,
  uniswapV2IntegrateeAddress,
  valueInterpreterAddress,
  vaultLibAddress,
  wethTokenAddress,
  zeroExV2AdapterAddress,
  alphaHomoraV1AdapterAddress,
} from '../addresses';
import { Release } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { networkId } from './Network';

export function useRelease(id: string): Release {
  let release = Release.load(id) as Release;
  if (release == null) {
    logCritical('Failed to load release {}.', [id]);
  }

  return release;
}

export function createRelease(address: Address, event: ethereum.Event): Release {
  let release = new Release(address.toHex());
  release.current = true;
  release.open = event.block.timestamp;
  release.network = networkId;

  release.adapterBlacklist = adapterBlacklistAddress.toHex();
  release.adapterWhitelist = adapterWhitelistAddress.toHex();
  release.aggregatedDerivativePriceFeed = aggregatedDerivativePriceFeedAddress.toHex();
  release.alphaHomoraV1Adapter = alphaHomoraV1AdapterAddress.toHex();
  release.assetBlacklist = assetBlacklistAddress.toHex();
  release.assetWhitelist = assetWhitelistAddress.toHex();
  release.authUserExecutedSharesRequestorFactory = authUserExecutedSharesRequestorFactoryAddress.toHex();
  release.buySharesCallerWhitelist = buySharesCallerWhitelistAddress.toHex();
  release.chaiAdapter = chaiAdapterAddress.toHex();
  release.chaiIntegratee = chaiIntegrateeAddress.toHex();
  release.chainlinkPriceFeed = chainlinkPriceFeedAddress.toHex();
  release.compoundAdapter = compoundAdapterAddress.toHex();
  release.comptrollerLib = comptrollerLibAddress.toHex();
  release.dispatcher = dispatcherAddress.toHex();
  release.entranceRateBurnFee = entranceRateBurnFeeAddress.toHex();
  release.entranceRateDirectFee = entranceRateDirectFeeAddress.toHex();
  release.feeManager = feeManagerAddress.toHex();
  release.fundActionsWrapper = fundActionsWrapperAddress.toHex();
  release.fundDeployer = fundDeployerAddress.toHex();
  release.guaranteedRedemption = guaranteedRedemptionAddress.toHex();
  release.integrationManager = integrationManagerAddress.toHex();
  release.investorWhitelist = investorWhitelistAddress.toHex();
  release.kyberAdapter = kyberAdapterAddress.toHex();
  release.kyberIntegratee = kyberIntegrateeAddress.toHex();
  release.managementFee = managementFeeAddress.toHex();
  release.maxConcentration = maxConcentrationAddress.toHex();
  release.minMaxInvestment = minMaxInvestmentAddress.toHex();
  release.paraSwapAdapter = paraSwapAdapterAddress.toHex();
  release.performanceFee = performanceFeeAddress.toHex();
  release.policyManager = policyManagerAddress.toHex();
  release.synthetixAdapter = synthetixAdapterAddress.toHex();
  release.synthetixAddressResolver = synthetixAddressResolverAddress.toHex();
  release.synthetixDelegateApprovals = synthetixDelegateApprovalsAddress.toHex();
  release.synthetixIntegratee = synthetixIntegrateeAddress.toHex();
  release.trackedAssetsAdapter = trackedAssetsAdapterAddress.toHex();
  release.uniswapV2Adapter = uniswapV2AdapterAddress.toHex();
  release.uniswapV2Integratee = uniswapV2IntegrateeAddress.toHex();
  release.valueInterpreter = valueInterpreterAddress.toHex();
  release.vaultLib = vaultLibAddress.toHex();
  release.wethToken = wethTokenAddress.toHex();
  release.zeroExV2Adapter = zeroExV2AdapterAddress.toHex();
  release.save();

  return release;
}

export function ensureRelease(id: string, event: ethereum.Event): Release {
  let release = Release.load(id) as Release;

  if (release != null) {
    return release;
  }

  return createRelease(Address.fromString(id), event);
}
