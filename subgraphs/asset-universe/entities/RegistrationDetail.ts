import { ETH } from '@enzymefinance/subgraph-utils';
import { Address, ethereum, log } from '@graphprotocol/graph-ts';
import {
  aavePriceFeedV2Address,
  aavePriceFeedV3Address,
  aavePriceFeedV4Address,
  alphaHomoraV1PriceFeedV2Address,
  alphaHomoraV1PriceFeedV3Address,
  compoundPriceFeedV2Address,
  compoundPriceFeedV3Address,
  compoundPriceFeedV4Address,
  curvePriceFeedV2Address,
  curvePriceFeedV3Address,
  curvePriceFeedV4Address,
  idlePriceFeedV2Address,
  idlePriceFeedV3Address,
  idlePriceFeedV4Address,
  stakehoundEthPriceFeedV2Address,
  stakehoundEthPriceFeedV3Address,
  stakehoundEthPriceFeedV4Address,
  synthetixPriceFeedV2Address,
  synthetixPriceFeedV3Address,
  synthetixPriceFeedV4Address,
  uniswapV2PoolPriceFeedV2Address,
  uniswapV2PoolPriceFeedV3Address,
  uniswapV2PoolPriceFeedV4Address,
  wethTokenAddress,
  yearnVaultV2PriceFeedV3Address,
  yearnVaultV2PriceFeedV4Address,
} from '../generated/configuration';
import { CurveSdk } from '../generated/contracts/CurveSdk';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import {
  AaveRegistrationDetail,
  AlphaHomoraV1RegistrationDetail,
  Asset,
  CompoundRegistrationDetail,
  CurvePoolRegistrationDetail,
  IdleRegistrationDetail,
  PrimitiveRegistrationDetail,
  Release,
  StakehoundEthRegistrationDetail,
  SynthetixRegistrationDetail,
  UniswapV2PoolRegistrationDetail,
  UnknownRegistrationDetail,
} from '../generated/schema';
import { getOrCreateAsset } from './Asset';

function registrationDetailId(release: Release, asset: Asset, event: ethereum.Event): string {
  return release.id + '/' + asset.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString();
}

export function getOrCreatePrimitiveRegistrationDetail(
  release: Release,
  asset: Asset,
  aggregator: Address,
  event: ethereum.Event,
): string {
  let id = registrationDetailId(release, asset, event);
  let detail = new PrimitiveRegistrationDetail(id);
  detail.type = 'PRIMITIVE';
  detail.aggregator = aggregator;
  detail.save();

  return id;
}

export function getOrCreateDerivativeRegistrationDetail(
  release: Release,
  asset: Asset,
  feed: Address,
  event: ethereum.Event,
): string {
  let id = registrationDetailId(release, asset, event);
  if (
    feed.equals(aavePriceFeedV2Address) ||
    feed.equals(aavePriceFeedV3Address) ||
    feed.equals(aavePriceFeedV4Address)
  ) {
    getOrCreateAaveDetail(id, asset, feed);
  } else if (feed.equals(alphaHomoraV1PriceFeedV2Address) || feed.equals(alphaHomoraV1PriceFeedV3Address)) {
    getOrCreateAlphaHomoraV1Detail(id, asset, feed);
  } else if (
    feed.equals(compoundPriceFeedV2Address) ||
    feed.equals(compoundPriceFeedV3Address) ||
    feed.equals(compoundPriceFeedV4Address)
  ) {
    getOrCreateCompoundDetail(id, asset, feed);
  } else if (
    feed.equals(curvePriceFeedV2Address) ||
    feed.equals(curvePriceFeedV3Address) ||
    feed.equals(curvePriceFeedV4Address)
  ) {
    getOrCreateCurveDetail(id, asset, feed);
  } else if (
    feed.equals(idlePriceFeedV2Address) ||
    feed.equals(idlePriceFeedV3Address) ||
    feed.equals(idlePriceFeedV4Address)
  ) {
    getOrCreateIdleDetail(id, asset, feed);
  } else if (
    feed.equals(stakehoundEthPriceFeedV2Address) ||
    feed.equals(stakehoundEthPriceFeedV3Address) ||
    feed.equals(stakehoundEthPriceFeedV4Address)
  ) {
    getOrCreateStakehoundEthDetail(id, asset, feed);
  } else if (
    feed.equals(synthetixPriceFeedV2Address) ||
    feed.equals(synthetixPriceFeedV3Address) ||
    feed.equals(synthetixPriceFeedV4Address)
  ) {
    getOrCreateSynthetixDetail(id, asset, feed);
  } else if (
    feed.equals(uniswapV2PoolPriceFeedV2Address) ||
    feed.equals(uniswapV2PoolPriceFeedV3Address) ||
    feed.equals(uniswapV2PoolPriceFeedV4Address)
  ) {
    getOrCreateUniswapV2PoolDetail(id, asset, feed);
  } else if (feed.equals(yearnVaultV2PriceFeedV3Address) || feed.equals(yearnVaultV2PriceFeedV4Address)) {
    getOrCreateYearnVaultV2Detail(id, asset, feed);
  } else {
    getOrCreateUnknownDetail(id, feed);
  }

  return id;
}

function getOrCreateAaveDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let underlying = priceFeedContract.try_getUnderlyingForDerivative(address);
  if (underlying.reverted) {
    log.warning('Reverted getUnderlyingForDerivative for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let detail = new AaveRegistrationDetail(id);
  detail.type = 'AAVE';
  detail.feed = feed;
  detail.underlyingAsset = getOrCreateAsset(underlying.value).id;
  detail.save();
}

function getOrCreateAlphaHomoraV1Detail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let underlying = priceFeedContract.try_getWethToken();
  if (underlying.reverted) {
    log.warning('Reverted getWethToken for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let detail = new AlphaHomoraV1RegistrationDetail(id);
  detail.type = 'ALPHA_HOMORA_V1';
  detail.feed = feed;
  detail.underlyingAsset = getOrCreateAsset(underlying.value).id;
  detail.save();
}

function getOrCreateCompoundDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('Reverted isSupported for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let underlying = priceFeedContract.try_getTokenFromCToken(address);
  if (underlying.reverted) {
    log.warning('Reverted getTokenFromCToken for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let detail = new CompoundRegistrationDetail(id);
  detail.type = 'COMPOUND';
  detail.feed = feed;
  detail.underlyingAsset = getOrCreateAsset(underlying.value).id;
  detail.save();
}

export function getOrCreateCurveDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('Reverted isSupported for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  // get derivative info
  let info = priceFeedContract.try_getDerivativeInfo(address);
  if (info.reverted) {
    log.warning('Reverted getDerivativeInfo for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  // get address provider from price feed
  let addressProviderAddress = priceFeedContract.try_getAddressProvider();
  if (addressProviderAddress.reverted) {
    log.warning('Reverted getAddressProvider for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  // get registry from address provider
  let addressProvider = CurveSdk.bind(addressProviderAddress.value);
  let registryAddress = addressProvider.try_get_registry();
  if (registryAddress.reverted) {
    log.warning('Reverted get_registry for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  // get required information from registry
  let registry = CurveSdk.bind(registryAddress.value);
  let nCoins = registry.try_get_n_coins(info.value.pool);
  let gauges = registry.try_get_gauges(info.value.pool);
  let coins = registry.try_get_coins(info.value.pool);
  if (nCoins.reverted || gauges.reverted || coins.reverted) {
    log.warning('Reverted get_n_coins, try_get_gauges or try_get_coins for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  // check if the derivative is a pool token or a gauge token
  let nCoinsValue = nCoins.value;
  let coinsValue = coins.value;
  let lpToken = registry.try_get_lp_token(info.value.pool);
  if (lpToken.reverted) {
    log.warning('Reverted get_lp_token for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let detail = new CurvePoolRegistrationDetail(id);
  detail.pool = info.value.pool;
  detail.gauge = gauges.value.value0[0];
  detail.lpToken = lpToken.value.toHex();
  detail.gaugeToken = gauges.value.value0[0].toHex();
  detail.curveAssetType = lpToken.value.equals(address) ? 'POOL' : 'GAUGE';
  detail.invariantProxyAsset = info.value.invariantProxyAsset.toHex();
  detail.numberOfTokens = nCoinsValue[0].toI32();

  let underlyingAssets = new Array<string>();
  underlyingAssets.push(getOrCreateAsset(coinsValue[0].equals(ETH) ? wethTokenAddress : coinsValue[0]).id);
  underlyingAssets.push(getOrCreateAsset(coinsValue[1].equals(ETH) ? wethTokenAddress : coinsValue[1]).id);
  if (nCoinsValue[0].toI32() == 3) {
    underlyingAssets.push(getOrCreateAsset(coinsValue[2].equals(ETH) ? wethTokenAddress : coinsValue[2]).id);
  }

  detail.type = 'CURVE_POOL';
  detail.feed = feed;
  detail.underlyingAssets = underlyingAssets;
  detail.save();
}

function getOrCreateIdleDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('Reverted isSupported for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let underlying = priceFeedContract.try_getUnderlyingForDerivative(address);
  if (underlying.reverted) {
    log.warning('Reverted getUnderlyingForDerivative for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let detail = new IdleRegistrationDetail(id);
  detail.type = 'IDLE';
  detail.feed = feed;
  detail.underlyingAsset = getOrCreateAsset(underlying.value).id;
  detail.save();
}

function getOrCreateStakehoundEthDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let underlying = priceFeedContract.try_getUnderlying();
  if (underlying.reverted) {
    log.warning('Reverted getUnderlying for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let detail = new StakehoundEthRegistrationDetail(id);
  detail.type = 'STAKEHOUND_ETH';
  detail.feed = feed;
  detail.underlyingAsset = getOrCreateAsset(underlying.value).id;
  detail.save();
}

function getOrCreateSynthetixDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let detail = new SynthetixRegistrationDetail(id);
  detail.type = 'SYNTHETIX';
  detail.feed = feed;
  detail.save();
}

function getOrCreateUniswapV2PoolDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let underlying = priceFeedContract.try_getPoolTokenUnderlyings(address);
  if (underlying.reverted) {
    log.warning('Reverted getPoolTokenUnderlyings for asset {} at pricefeed {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let token0 = getOrCreateAsset(underlying.value.value0);
  let token1 = getOrCreateAsset(underlying.value.value1);

  let detail = new UniswapV2PoolRegistrationDetail(id);
  detail.type = 'UNISWAP_V2_POOL';
  detail.feed = feed;
  detail.underlyingAssets = [token0.id, token1.id];
  detail.save();

  derivative.name = 'Uniswap ' + token0.symbol + '/' + token1.symbol + ' Pool';
  derivative.save();
}

function getOrCreateYearnVaultV2Detail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let underlying = priceFeedContract.try_getUnderlyingForDerivative(address);
  if (underlying.reverted) {
    log.warning('Reverted getUnderlyingForDerivative for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, feed);
    return;
  }

  let detail = new StakehoundEthRegistrationDetail(id);
  detail.type = 'YEARN_VAULT_V2';
  detail.feed = feed;
  detail.underlyingAsset = getOrCreateAsset(underlying.value).id;
  detail.save();
}

function getOrCreateUnknownDetail(id: string, feed: Address): void {
  let detail = new UnknownRegistrationDetail(id);
  detail.type = 'UNKNOWN';
  detail.feed = feed;
  detail.save();
}
