import { Address } from '@graphprotocol/graph-ts';
import { releaseAddressesA, releaseAddressesB, wethTokenAddress } from '../addresses';
import { CurvePriceFeedContract } from '../generated/CurvePriceFeedContract';
import { CurveRegistryContract } from '../generated/CurveRegistryContract';
import { ICurveAddressProviderContract } from '../generated/ICurveAddressProviderContract';
import { Asset, CurvePoolAssetDetail } from '../generated/schema';
import { ethAddress } from '../utils/ethAddress';

export function checkCurvePoolAssetDetail(derivative: Asset, derivativePriceFeedAddress: Address): void {
  let address = Address.fromString(derivative.id);

  if (
    derivativePriceFeedAddress.notEqual(releaseAddressesA.curvePriceFeedAddress) &&
    derivativePriceFeedAddress.notEqual(releaseAddressesB.curvePriceFeedAddress)
  ) {
    return;
  }

  let priceFeedContract = CurvePriceFeedContract.bind(derivativePriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  // get derivative info
  let info = priceFeedContract.try_getDerivativeInfo(address);
  if (info.reverted) {
    return;
  }

  // get address provider from price feed
  let addressProviderAddress = priceFeedContract.try_getAddressProvider();
  if (addressProviderAddress.reverted) {
    return;
  }

  let addressProvider = ICurveAddressProviderContract.bind(addressProviderAddress.value);

  // get registry from address provider
  let registryAddress = addressProvider.try_get_registry();
  if (registryAddress.reverted) {
    return;
  }

  let registry = CurveRegistryContract.bind(registryAddress.value);

  // get required information from registry
  let nCoins = registry.try_get_n_coins(info.value.pool);
  let gauges = registry.try_get_gauges(info.value.pool);
  let coins = registry.try_get_coins(info.value.pool);

  if (nCoins.reverted || gauges.reverted || coins.reverted) {
    return;
  }

  let nCoinsValue = nCoins.value;
  let coinsValue = coins.value;

  // check if the derivative is a pool token or a gauge token
  let lpToken = registry.try_get_lp_token(info.value.pool);
  if (lpToken.reverted) {
    return;
  }

  let curveAssetType = lpToken.value.equals(address) ? 'POOL' : 'GAUGE';

  let details = new CurvePoolAssetDetail(derivative.id);
  details.pool = info.value.pool.toHex();
  details.gauge = gauges.value.value0[0].toHex();
  details.lpToken = lpToken.value.toHex();
  details.gaugeToken = gauges.value.value0[0].toHex();
  details.curveAssetType = curveAssetType;
  details.invariantProxyAsset = info.value.invariantProxyAsset.toHex();
  details.numberOfTokens = nCoinsValue[0].toI32();
  details.token0 = coinsValue[0].equals(ethAddress) ? wethTokenAddress.toHex() : coinsValue[0].toHex();
  details.token1 = coinsValue[1].equals(ethAddress) ? wethTokenAddress.toHex() : coinsValue[1].toHex();
  if (nCoinsValue[0].toI32() == 3) {
    details.token2 = coinsValue[2].equals(ethAddress) ? wethTokenAddress.toHex() : coinsValue[2].toHex();
  }
  details.save();

  derivative.derivativeType = 'CurvePool';
  derivative.curvePoolAssetDetails = details.id;
  derivative.save();
}
