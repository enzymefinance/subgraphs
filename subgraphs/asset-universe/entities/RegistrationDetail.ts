import { ETH } from '@enzymefinance/subgraph-utils';
import { Address, ethereum, log } from '@graphprotocol/graph-ts';
import {
  wethTokenAddress,
  aavePriceFeedV2Address,
  aavePriceFeedV3Address,
  alphaHomoraV1PriceFeedV2Address,
  alphaHomoraV1PriceFeedV3Address,
  idlePriceFeedV2Address,
  stakehoundEthPriceFeedV2Address,
  synthetixPriceFeedV2Address,
  uniswapV2PoolPriceFeedV2Address,
  uniswapV2PoolPriceFeedV3Address,
  yearnVaultV2PriceFeedV3Address,
  compoundPriceFeedV2Address,
  compoundPriceFeedV3Address,
  curvePriceFeedV2Address,
  curvePriceFeedV3Address,
  idlePriceFeedV3Address,
  stakehoundEthPriceFeedV3Address,
  synthetixPriceFeedV3Address,
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
  StakehoundEthRegistrationDetail,
  SynthetixRegistrationDetail,
  UniswapV2PoolRegistrationDetail,
  UnknownRegistrationDetail,
  Version,
} from '../generated/schema';
import { tokenSymbol } from '../utils/tokenCalls';

function registrationDetailId(version: Version, asset: Asset, event: ethereum.Event): string {
  return version.id + '/' + asset.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString();
}

export function getOrCreatePrimitiveRegistrationDetail(
  version: Version,
  asset: Asset,
  aggregator: Address,
  event: ethereum.Event,
): string {
  let id = registrationDetailId(version, asset, event);
  let detail = new PrimitiveRegistrationDetail(id);
  detail.aggregator = aggregator;
  detail.save();

  return id;
}

export function getOrCreateDerivativeRegistrationDetail(
  version: Version,
  asset: Asset,
  feed: Address,
  event: ethereum.Event,
): string {
  let id = registrationDetailId(version, asset, event);
  if (feed.equals(aavePriceFeedV2Address) || feed.equals(aavePriceFeedV3Address)) {
    getOrCreateAaveDetail(id, asset, feed);
  } else if (feed.equals(alphaHomoraV1PriceFeedV2Address) || feed.equals(alphaHomoraV1PriceFeedV3Address)) {
    getOrCreateAlphaHomoraV1Detail(id, asset, feed);
  } else if (feed.equals(compoundPriceFeedV2Address) || feed.equals(compoundPriceFeedV3Address)) {
    getOrCreateCompoundDetail(id, asset, feed);
  } else if (feed.equals(curvePriceFeedV2Address) || feed.equals(curvePriceFeedV3Address)) {
    getOrCreateCurveDetail(id, asset, feed);
  } else if (feed.equals(idlePriceFeedV2Address) || feed.equals(idlePriceFeedV3Address)) {
    getOrCreateIdleDetail(id, asset, feed);
  } else if (feed.equals(stakehoundEthPriceFeedV2Address) || feed.equals(stakehoundEthPriceFeedV3Address)) {
    getOrCreateStakehoundEthDetail(id, asset, feed);
  } else if (feed.equals(synthetixPriceFeedV2Address) || feed.equals(synthetixPriceFeedV3Address)) {
    getOrCreateSynthetixDetail(id, asset, feed);
  } else if (feed.equals(uniswapV2PoolPriceFeedV2Address) || feed.equals(uniswapV2PoolPriceFeedV3Address)) {
    getOrCreateUniswapV2PoolDetail(id, asset, feed);
  } else if (feed.equals(yearnVaultV2PriceFeedV3Address)) {
    getOrCreateYearnVaultV2Detail(id, asset, feed);
  } else {
    getOrCreateUnknownDetail(id, asset, feed);
  }

  return id;
}

function getOrCreateAaveDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let underlying = priceFeedContract.try_getUnderlyingForDerivative(address);
  if (underlying.reverted) {
    log.warning('Reverted getUnderlyingForDerivative for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let detail = new AaveRegistrationDetail(id);
  detail.feed = feed;
  detail.underlyingAsset = underlying.value.toHex();
  detail.save();
}

function getOrCreateAlphaHomoraV1Detail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let underlying = priceFeedContract.try_getWethToken();
  if (underlying.reverted) {
    log.warning('Reverted getWethToken for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let detail = new AlphaHomoraV1RegistrationDetail(id);
  detail.feed = feed;
  detail.underlyingAsset = underlying.value.toHex();
  detail.save();
}

function getOrCreateCompoundDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('Reverted isSupported for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let underlying = priceFeedContract.try_getTokenFromCToken(address);
  if (underlying.reverted) {
    log.warning('Reverted getTokenFromCToken for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let detail = new CompoundRegistrationDetail(id);
  detail.feed = feed;
  detail.underlyingAsset = underlying.value.toHex();
  detail.save();
}

export function getOrCreateCurveDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('Reverted isSupported for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  // get derivative info
  let info = priceFeedContract.try_getDerivativeInfo(address);
  if (info.reverted) {
    log.warning('Reverted getDerivativeInfo for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  // get address provider from price feed
  let addressProviderAddress = priceFeedContract.try_getAddressProvider();
  if (addressProviderAddress.reverted) {
    log.warning('Reverted getAddressProvider for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  // get registry from address provider
  let addressProvider = CurveSdk.bind(addressProviderAddress.value);
  let registryAddress = addressProvider.try_get_registry();
  if (registryAddress.reverted) {
    log.warning('Reverted get_registry for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  // get required information from registry
  let registry = CurveSdk.bind(registryAddress.value);
  let nCoins = registry.try_get_n_coins(info.value.pool);
  let gauges = registry.try_get_gauges(info.value.pool);
  let coins = registry.try_get_coins(info.value.pool);
  if (nCoins.reverted || gauges.reverted || coins.reverted) {
    log.warning('Reverted get_n_coins, try_get_gauges or try_get_coins for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  // check if the derivative is a pool token or a gauge token
  let nCoinsValue = nCoins.value;
  let coinsValue = coins.value;
  let lpToken = registry.try_get_lp_token(info.value.pool);
  if (lpToken.reverted) {
    log.warning('Reverted get_lp_token for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let curveAssetType = lpToken.value.equals(address) ? 'POOL' : 'GAUGE';
  let detail = new CurvePoolRegistrationDetail(id);
  detail.pool = info.value.pool;
  detail.gauge = gauges.value.value0[0];
  detail.lpToken = lpToken.value.toHex();
  detail.gaugeToken = gauges.value.value0[0].toHex();
  detail.curveAssetType = curveAssetType;
  detail.invariantProxyAsset = info.value.invariantProxyAsset.toHex();
  detail.numberOfTokens = nCoinsValue[0].toI32();

  let underlyingAssets = new Array<string>();
  underlyingAssets.push(coinsValue[0].equals(ETH) ? wethTokenAddress.toHex() : coinsValue[0].toHex());
  underlyingAssets.push(coinsValue[1].equals(ETH) ? wethTokenAddress.toHex() : coinsValue[1].toHex());
  if (nCoinsValue[0].toI32() == 3) {
    underlyingAssets.push(coinsValue[2].equals(ETH) ? wethTokenAddress.toHex() : coinsValue[2].toHex());
  }

  detail.underlyingAssets = underlyingAssets;
  detail.save();
}

function getOrCreateIdleDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('Reverted isSupported for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let underlying = priceFeedContract.try_getUnderlyingForDerivative(address);
  if (underlying.reverted) {
    log.warning('Reverted getUnderlyingForDerivative for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let detail = new IdleRegistrationDetail(id);
  detail.feed = feed;
  detail.underlyingAsset = underlying.value.toHex();
  detail.save();
}

function getOrCreateStakehoundEthDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let underlying = priceFeedContract.try_getUnderlying();
  if (underlying.reverted) {
    log.warning('Reverted getUnderlying for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let detail = new StakehoundEthRegistrationDetail(id);
  detail.feed = feed;
  detail.underlyingAsset = underlying.value.toHex();
  detail.save();
}

function getOrCreateSynthetixDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let detail = new SynthetixRegistrationDetail(id);
  detail.feed = feed;
  detail.save();
}

function getOrCreateUniswapV2PoolDetail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let underlying = priceFeedContract.try_getPoolTokenUnderlyings(address);
  if (underlying.reverted) {
    log.warning('Reverted getPoolTokenUnderlyings for asset {} at pricefeed {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let token0Address = underlying.value.value0;
  let token1Address = underlying.value.value1;
  let detail = new UniswapV2PoolRegistrationDetail(derivative.id);
  detail.feed = feed;
  detail.underlyingAssets = [token0Address.toHex(), token1Address.toHex()];
  detail.save();

  let symbol0 = tokenSymbol(token0Address);
  let symbol1 = tokenSymbol(token1Address);

  let name = 'Uniswap ' + symbol0 + '/' + symbol1 + ' Pool';

  derivative.name = name;
  derivative.save();
}

function getOrCreateYearnVaultV2Detail(id: string, derivative: Asset, feed: Address): void {
  let address = Address.fromString(derivative.id);
  let priceFeedContract = ProtocolSdk.bind(feed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);
  if (isSupported.reverted || isSupported.value == false) {
    log.warning('{} is not a supported asset of {}', [derivative.id, feed.toHex()]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let underlying = priceFeedContract.try_getUnderlyingForDerivative(address);
  if (underlying.reverted) {
    log.warning('Reverted getUnderlyingForDerivative for asset {}', [derivative.id]);
    getOrCreateUnknownDetail(id, derivative, feed);
    return;
  }

  let detail = new StakehoundEthRegistrationDetail(id);
  detail.feed = feed;
  detail.underlyingAsset = underlying.value.toHex();
  detail.save();
}

function getOrCreateUnknownDetail(id: string, derivative: Asset, feed: Address): void {
  let info = new UnknownRegistrationDetail(id);
  info.feed = feed;
  info.save();
}
