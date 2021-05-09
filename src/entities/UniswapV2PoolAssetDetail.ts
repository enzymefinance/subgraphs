import { Address, log } from '@graphprotocol/graph-ts';
import { releaseAddressesA, releaseAddressesB } from '../addresses';
import { Asset, UniswapV2PoolAssetDetail } from '../generated/schema';
import { UniswapV2PoolPriceFeedContract } from '../generated/UniswapV2PoolPriceFeedContract';
import { getERC20Symbol } from '../utils/getERC20Symbol';

export function checkUniswapV2PoolAssetDetail(derivative: Asset, derivativePriceFeedAddress: Address): void {
  let address = Address.fromString(derivative.id);

  if (
    derivativePriceFeedAddress.notEqual(releaseAddressesA.uniswapV2PoolPriceFeedAddress) &&
    derivativePriceFeedAddress.notEqual(releaseAddressesB.uniswapV2PoolPriceFeedAddress)
  ) {
    return;
  }

  let priceFeedContract = UniswapV2PoolPriceFeedContract.bind(derivativePriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  let underlying = priceFeedContract.try_getPoolTokenUnderlyings(address);

  if (underlying.reverted) {
    log.warning('Reverted getPoolTokenUnderlyings for asset {} at pricefeed {}', [
      derivative.id,
      derivativePriceFeedAddress.toHex(),
    ]);
    return;
  }

  let details = new UniswapV2PoolAssetDetail(derivative.id);
  let token0Address = underlying.value.value0;
  let token1Address = underlying.value.value1;

  details.token0 = token0Address.toHex();
  details.token1 = token1Address.toHex();
  details.save();

  let symbol0 = getERC20Symbol(token0Address);
  let symbol1 = getERC20Symbol(token1Address);

  let name = 'Uniswap ' + symbol0 + '/' + symbol1 + ' Pool';

  derivative.name = name;
  derivative.derivativeType = 'UniswapPool';
  derivative.uniswapV2PoolAssetDetails = details.id;
  derivative.save();
}
