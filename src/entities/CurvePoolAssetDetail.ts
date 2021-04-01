import { Address } from '@graphprotocol/graph-ts';
import { curvePriceFeed } from '../addresses';
import { CurvePriceFeedContract } from '../generated/CurvePriceFeedContract';
import { CurveRegistryContract } from '../generated/CurveRegistryContract';
import { ICurveAddressProviderContract } from '../generated/ICurveAddressProviderContract';
import { Asset, CurvePoolAssetDetail } from '../generated/schema';

export function checkCurvePoolAssetDetail(derivative: Asset): void {
  let address = Address.fromString(derivative.id);

  let priceFeedContract = CurvePriceFeedContract.bind(curvePriceFeed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  // get derivative info
  let info = priceFeedContract.getDerivativeInfo(address);

  // get address provider from price feed
  let addressProviderAddress = priceFeedContract.getAddressProvider();
  let addressProvider = ICurveAddressProviderContract.bind(addressProviderAddress);

  // get registry from address provider
  let registryAddress = addressProvider.get_registry();
  let registry = CurveRegistryContract.bind(registryAddress);

  // get required information from registry
  let nCoins = registry.get_n_coins(info.pool);
  let gauges = registry.get_gauges(info.pool);
  let coins = registry.get_coins(info.pool);

  let details = new CurvePoolAssetDetail(derivative.id);
  details.pool = info.pool.toHex();
  details.gauge = gauges.value0[0].toHex();
  details.numberOfTokens = nCoins[0].toI32();
  details.invariantProxyAsset = info.invariantProxyAsset.toHex();
  details.token0 = coins[0].toHex();
  details.token1 = coins[1].toHex();
  if (nCoins[0].toI32() >= 3) {
    details.token2 = coins[2].toHex();
  }
  details.save();

  derivative.derivativeType = 'Curve';
  derivative.curvePoolAssetDetails = details.id;
  derivative.save();
}
