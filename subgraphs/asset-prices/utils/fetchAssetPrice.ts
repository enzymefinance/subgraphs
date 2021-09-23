import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { SharedSdk } from '../generated/contracts/SharedSdk';
import { Asset } from '../generated/schema';
import {
  valueInterpreterV2Address,
  valueInterpreterV3Address,
  valueInterpreterV4Address,
  wethTokenAddress,
} from '../generated/configuration';

export function fetchAssetPrice(asset: Asset, version: number): BigDecimal {
  switch (version as i32) {
    case 2:
      return fetchAssetPriceLegacy(asset, valueInterpreterV2Address);
    case 3:
      return fetchAssetPriceLegacy(asset, valueInterpreterV3Address);
    default:
      return fetchAssetPriceNew(asset, valueInterpreterV4Address);
  }
}

function fetchAssetPriceNew(asset: Asset, interpreter: Address): BigDecimal {
  // NOTE: Because we are using one "unit" of the given derivative as the amount when
  // calculating the value with the value interpreter, this is also the rate.
  let one = BigInt.fromI32(10).pow(asset.decimals as u8);
  let address = Address.fromString(asset.id);
  let contract = SharedSdk.bind(interpreter);
  let call = contract.try_calcCanonicalAssetValue1(address, one, wethTokenAddress);
  let value = !call.reverted ? toBigDecimal(call.value) : BigDecimal.fromString('0');

  return value;
}

function fetchAssetPriceLegacy(asset: Asset, interpreter: Address): BigDecimal {
  // NOTE: Because we are using one "unit" of the given derivative as the amount when
  // calculating the value with the value interpreter, this is also the rate.
  let one = BigInt.fromI32(10).pow(asset.decimals as u8);
  let address = Address.fromString(asset.id);
  let contract = SharedSdk.bind(interpreter);
  let call = contract.try_calcCanonicalAssetValue(address, one, wethTokenAddress);
  let valid = !call.reverted && call.value.value1 == true;
  let value = valid ? toBigDecimal(call.value.value0) : BigDecimal.fromString('0');

  return value;
}
