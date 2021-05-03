import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  aaveAdapterAddress,
  aavePriceFeedAddress,
  adapterBlacklistAddress,
  adapterWhitelistAddress,
  aggregatedDerivativePriceFeedAddress,
  alphaHomoraV1AdapterAddress,
  alphaHomoraV1PriceFeedAddress,
  assetBlacklistAddress,
  assetWhitelistAddress,
  authUserExecutedSharesRequestorFactoryAddress,
  buySharesCallerWhitelistAddress,
  chaiAdapterAddress,
  chaiIntegrateeAddress,
  chainlinkPriceFeedAddress,
  chaiPriceFeedAddress,
  compoundAdapterAddress,
  compoundPriceFeedAddress,
  comptrollerLibAddress,
  curveExchangeAdapterAddress,
  curveLiquidityAaveAdapterAddress,
  curveLiquiditySethAdapterAddress,
  curveLiquidityStethAdapterAddress,
  curvePriceFeedAddress,
  dispatcherAddress,
  entranceRateBurnFeeAddress,
  entranceRateDirectFeeAddress,
  feeManagerAddress,
  fundActionsWrapperAddress,
  fundDeployerAddress,
  guaranteedRedemptionAddress,
  idleAdapterAddress,
  idlePriceFeedAddress,
  integrationManagerAddress,
  investorWhitelistAddress,
  kyberAdapterAddress,
  kyberIntegrateeAddress,
  lidoStethPriceFeedAddress,
  managementFeeAddress,
  maxConcentrationAddress,
  minMaxInvestmentAddress,
  paraSwapAdapterAddress,
  paraSwapV4AdapterAddress,
  performanceFeeAddress,
  policyManagerAddress,
  stakehoundEthPriceFeedAddress,
  synthetixAdapterAddress,
  synthetixAddressResolverAddress,
  synthetixDelegateApprovalsAddress,
  synthetixIntegrateeAddress,
  synthetixPriceFeedAddress,
  trackedAssetsAdapterAddress,
  uniswapV2AdapterAddress,
  uniswapV2IntegrateeAddress,
  uniswapV2PoolPriceFeedAddress,
  valueInterpreterAddress,
  vaultLibAddress,
  wdgldPriceFeedAddress,
  wethTokenAddress,
  zeroExV2AdapterAddress,
} from '../addresses';
import { Release } from '../generated/schema';
import { networkId } from './Network';

export function createRelease(address: Address, event: ethereum.Event): Release {
  let release = new Release(address.toHex());
  release.current = true;
  release.open = event.block.timestamp;
  release.network = networkId;

  release.aavePriceFeed = aavePriceFeedAddress.toHex();
  release.adapterBlacklist = adapterBlacklistAddress.toHex();
  release.adapterWhitelist = adapterWhitelistAddress.toHex();
  release.aggregatedDerivativePriceFeed = aggregatedDerivativePriceFeedAddress.toHex();
  release.alphaHomoraV1Adapter = alphaHomoraV1AdapterAddress.toHex();
  release.alphaHomoraV1PriceFeed = alphaHomoraV1PriceFeedAddress.toHex();
  release.aaveAdapter = aaveAdapterAddress.toHex();
  release.assetBlacklist = assetBlacklistAddress.toHex();
  release.assetWhitelist = assetWhitelistAddress.toHex();
  release.authUserExecutedSharesRequestorFactory = authUserExecutedSharesRequestorFactoryAddress.toHex();
  release.buySharesCallerWhitelist = buySharesCallerWhitelistAddress.toHex();
  release.chaiAdapter = chaiAdapterAddress.toHex();
  release.chaiIntegratee = chaiIntegrateeAddress.toHex();
  release.chainlinkPriceFeed = chainlinkPriceFeedAddress.toHex();
  release.chaiPriceFeed = chaiPriceFeedAddress.toHex();
  release.compoundAdapter = compoundAdapterAddress.toHex();
  release.compoundPriceFeed = compoundPriceFeedAddress.toHex();
  release.comptrollerLib = comptrollerLibAddress.toHex();
  release.curvePriceFeed = curvePriceFeedAddress.toHex();
  release.curveExchangeAdapter = curveExchangeAdapterAddress.toHex();
  release.curveLiquidityAaveAdapter = curveLiquidityAaveAdapterAddress.toHex();
  release.curveLiquiditySethAdapter = curveLiquiditySethAdapterAddress.toHex();
  release.curveLiquidityStethAdapter = curveLiquidityStethAdapterAddress.toHex();
  release.dispatcher = dispatcherAddress.toHex();
  release.entranceRateBurnFee = entranceRateBurnFeeAddress.toHex();
  release.entranceRateDirectFee = entranceRateDirectFeeAddress.toHex();
  release.feeManager = feeManagerAddress.toHex();
  release.fundActionsWrapper = fundActionsWrapperAddress.toHex();
  release.fundDeployer = fundDeployerAddress.toHex();
  release.guaranteedRedemption = guaranteedRedemptionAddress.toHex();
  release.idleAdapter = idleAdapterAddress.toHex();
  release.idlePriceFeed = idlePriceFeedAddress.toHex();
  release.integrationManager = integrationManagerAddress.toHex();
  release.investorWhitelist = investorWhitelistAddress.toHex();
  release.kyberAdapter = kyberAdapterAddress.toHex();
  release.kyberIntegratee = kyberIntegrateeAddress.toHex();
  release.lidoStethPriceFeed = lidoStethPriceFeedAddress.toHex();
  release.managementFee = managementFeeAddress.toHex();
  release.maxConcentration = maxConcentrationAddress.toHex();
  release.minMaxInvestment = minMaxInvestmentAddress.toHex();
  release.paraSwapAdapter = paraSwapAdapterAddress.toHex();
  release.paraSwapV4Adapter = paraSwapV4AdapterAddress.toHex();
  release.performanceFee = performanceFeeAddress.toHex();
  release.policyManager = policyManagerAddress.toHex();
  release.stakehoundEthPriceFeed = stakehoundEthPriceFeedAddress.toHex();
  release.synthetixAdapter = synthetixAdapterAddress.toHex();
  release.synthetixAddressResolver = synthetixAddressResolverAddress.toHex();
  release.synthetixDelegateApprovals = synthetixDelegateApprovalsAddress.toHex();
  release.synthetixIntegratee = synthetixIntegrateeAddress.toHex();
  release.synthetixPriceFeed = synthetixPriceFeedAddress.toHex();
  release.trackedAssetsAdapter = trackedAssetsAdapterAddress.toHex();
  release.uniswapV2Adapter = uniswapV2AdapterAddress.toHex();
  release.uniswapV2Integratee = uniswapV2IntegrateeAddress.toHex();
  release.uniswapV2PoolPriceFeed = uniswapV2PoolPriceFeedAddress.toHex();
  release.valueInterpreter = valueInterpreterAddress.toHex();
  release.vaultLib = vaultLibAddress.toHex();
  release.wdgldPriceFeed = wdgldPriceFeedAddress.toHex();
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
