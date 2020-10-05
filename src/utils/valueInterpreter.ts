import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Asset } from '../generated/schema';
import { ValueInterpreterContract } from '../generated/ValueInterpreterContract';
import {
  valueInterpreterAddress,
  chainlinkPriceFeedAddress,
  aggregatedDerivativePriceFeedAddress,
  wethTokenAddress,
} from '../addresses';
import { toBigDecimal } from './toBigDecimal';

export function fetchAssetPrice(asset: Asset): BigDecimal {
  // Whenever a new asset is registered, we need to fetch its current price immediately.
  let contract = ValueInterpreterContract.bind(valueInterpreterAddress);

  // NOTE: Because we are using one "unit" of the given derivative as the amount when
  // calculating the value with the value interpreter, this is also the rate.
  let one = BigInt.fromI32(10).pow(asset.decimals as u8);
  let address = Address.fromString(asset.id);
  let value = contract.calcCanonicalAssetValue(
    chainlinkPriceFeedAddress,
    aggregatedDerivativePriceFeedAddress,
    address,
    one,
    wethTokenAddress,
  );

  // TODO: Do we have to use the derivative decimals here or 18?!?
  // let current = toBigDecimal(value.value0, 18);
  return toBigDecimal(value.value0, asset.decimals);
}
