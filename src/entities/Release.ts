import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  chaiIntegrateeAddress,
  dispatcherAddress,
  kyberIntegrateeAddress,
  ReleaseAddresses,
  releaseAddressesA,
  releaseAddressesB,
  synthetixAddressResolverAddress,
  synthetixDelegateApprovalsAddress,
  synthetixIntegrateeAddress,
  uniswapV2IntegrateeAddress,
  wethTokenAddress,
} from '../addresses';
import { Release } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { networkId } from './Network';

export function createRelease(address: Address, event: ethereum.Event): Release {
  let release = new Release(address.toHex());
  release.current = true;
  release.open = event.block.timestamp;
  release.network = networkId;

  let releaseAddresses: ReleaseAddresses;
  if (address.equals(releaseAddressesA.fundDeployerAddress)) {
    releaseAddresses = releaseAddressesA;
  } else if (address.equals(releaseAddressesB.fundDeployerAddress)) {
    releaseAddresses = releaseAddressesB;
  } else {
    logCritical('Release with FundDeployer {} not found.', [address.toHex()]);
    return release;
  }

  release.aaveAdapter = releaseAddresses.aaveAdapterAddress.toHex();
  release.aavePriceFeed = releaseAddresses.aavePriceFeedAddress.toHex();
  release.adapterBlacklist = releaseAddresses.adapterBlacklistAddress.toHex();
  release.adapterWhitelist = releaseAddresses.adapterWhitelistAddress.toHex();
  release.aggregatedDerivativePriceFeed = releaseAddresses.aggregatedDerivativePriceFeedAddress.toHex();
  release.alphaHomoraV1Adapter = releaseAddresses.alphaHomoraV1AdapterAddress.toHex();
  release.alphaHomoraV1PriceFeed = releaseAddresses.alphaHomoraV1PriceFeedAddress.toHex();
  release.assetBlacklist = releaseAddresses.assetBlacklistAddress.toHex();
  release.assetWhitelist = releaseAddresses.assetWhitelistAddress.toHex();
  release.buySharesCallerWhitelist = releaseAddresses.buySharesCallerWhitelistAddress.toHex();
  release.chaiAdapter = releaseAddresses.chaiAdapterAddress.toHex();
  release.chaiIntegratee = chaiIntegrateeAddress.toHex();
  release.chainlinkPriceFeed = releaseAddresses.chainlinkPriceFeedAddress.toHex();
  release.chaiPriceFeed = releaseAddresses.chaiPriceFeedAddress.toHex();
  release.compoundAdapter = releaseAddresses.compoundAdapterAddress.toHex();
  release.compoundPriceFeed = releaseAddresses.compoundPriceFeedAddress.toHex();
  release.comptrollerLib = releaseAddresses.comptrollerLibAddress.toHex();
  release.curveExchangeAdapter = releaseAddresses.curveExchangeAdapterAddress.toHex();
  release.curveLiquidityAaveAdapter = releaseAddresses.curveLiquidityAaveAdapterAddress.toHex();
  release.curveLiquidityEursAdapter = releaseAddresses.curveLiquidityEursAdapterAddress.toHex();
  release.curveLiquiditySethAdapter = releaseAddresses.curveLiquiditySethAdapterAddress.toHex();
  release.curveLiquidityStethAdapter = releaseAddresses.curveLiquidityStethAdapterAddress.toHex();
  release.curvePriceFeed = releaseAddresses.curvePriceFeedAddress.toHex();
  release.dispatcher = dispatcherAddress.toHex();
  release.entranceRateBurnFee = releaseAddresses.entranceRateBurnFeeAddress.toHex();
  release.entranceRateDirectFee = releaseAddresses.entranceRateDirectFeeAddress.toHex();
  release.feeManager = releaseAddresses.feeManagerAddress.toHex();
  release.fundActionsWrapper = releaseAddresses.fundActionsWrapperAddress.toHex();
  release.fundDeployer = releaseAddresses.fundDeployerAddress.toHex();
  release.guaranteedRedemption = releaseAddresses.guaranteedRedemptionAddress.toHex();
  release.idleAdapter = releaseAddresses.idleAdapterAddress.toHex();
  release.idlePriceFeed = releaseAddresses.idlePriceFeedAddress.toHex();
  release.integrationManager = releaseAddresses.integrationManagerAddress.toHex();
  release.investorWhitelist = releaseAddresses.investorWhitelistAddress.toHex();
  release.kyberAdapter = releaseAddresses.kyberAdapterAddress.toHex();
  release.kyberIntegratee = kyberIntegrateeAddress.toHex();
  release.lidoStethPriceFeed = releaseAddresses.lidoStethPriceFeedAddress.toHex();
  release.managementFee = releaseAddresses.managementFeeAddress.toHex();
  release.maxConcentration = releaseAddresses.maxConcentrationAddress.toHex();
  release.minMaxInvestment = releaseAddresses.minMaxInvestmentAddress.toHex();
  release.paraSwapAdapter = releaseAddresses.paraSwapAdapterAddress.toHex();
  release.paraSwapV4Adapter = releaseAddresses.paraSwapV4AdapterAddress.toHex();
  release.performanceFee = releaseAddresses.performanceFeeAddress.toHex();
  release.policyManager = releaseAddresses.policyManagerAddress.toHex();
  release.stakehoundEthPriceFeed = releaseAddresses.stakehoundEthPriceFeedAddress.toHex();
  release.synthetixAdapter = releaseAddresses.synthetixAdapterAddress.toHex();
  release.synthetixAddressResolver = synthetixAddressResolverAddress.toHex();
  release.synthetixDelegateApprovals = synthetixDelegateApprovalsAddress.toHex();
  release.synthetixIntegratee = synthetixIntegrateeAddress.toHex();
  release.synthetixPriceFeed = releaseAddresses.synthetixPriceFeedAddress.toHex();
  release.trackedAssetsAdapter = releaseAddresses.trackedAssetsAdapterAddress.toHex();
  release.uniswapV2Adapter = releaseAddresses.uniswapV2AdapterAddress.toHex();
  release.uniswapV2Integratee = uniswapV2IntegrateeAddress.toHex();
  release.uniswapV2PoolPriceFeed = releaseAddresses.uniswapV2PoolPriceFeedAddress.toHex();
  release.valueInterpreter = releaseAddresses.valueInterpreterAddress.toHex();
  release.vaultLib = releaseAddresses.vaultLibAddress.toHex();
  release.wdgldPriceFeed = releaseAddresses.wdgldPriceFeedAddress.toHex();
  release.wethToken = wethTokenAddress.toHex();
  release.yearnVaultV2Adapter = releaseAddresses.yearnVaultV2AdapterAddress.toHex();
  release.yearnVaultV2PriceFeed = releaseAddresses.yearnVaultV2PriceFeedAddress.toHex();
  release.zeroExV2Adapter = releaseAddresses.zeroExV2AdapterAddress.toHex();
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

export function releaseFromPriceFeed(event: ethereum.Event): Release | null {
  let priceFeed = event.address;

  let release: Release;
  if (
    priceFeed.equals(releaseAddressesA.chainlinkPriceFeedAddress) ||
    priceFeed.equals(releaseAddressesA.aggregatedDerivativePriceFeedAddress)
  ) {
    release = ensureRelease(releaseAddressesA.fundDeployerAddress.toHex(), event);
  } else if (
    priceFeed.equals(releaseAddressesB.chainlinkPriceFeedAddress) ||
    priceFeed.equals(releaseAddressesB.aggregatedDerivativePriceFeedAddress)
  ) {
    release = ensureRelease(releaseAddressesB.fundDeployerAddress.toHex(), event);
  } else {
    logCritical('Release with PriceFeed {} not found.', [priceFeed.toHex()]);
    return null;
  }

  return release;
}
