import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ValueInterpreterContract } from '../generated/ValueInterpreterContract';
import { ValueInterpreterLegacyContract } from '../generated/ValueInterpreterLegacyContract';
import { Asset } from '../generated/schema';
import { valueInterpreterV2Address, valueInterpreterV3Address, wethTokenAddress } from '../generated/configuration';

export function fetchAssetPrice(asset: Asset, valueInterpreter: Address): BigDecimal {
  if (valueInterpreter.equals(valueInterpreterV2Address) || valueInterpreter.equals(valueInterpreterV3Address)) {
    return fetchAssetPriceLegacy(asset, valueInterpreter);
  }

  // NOTE: Because we are using one "unit" of the given derivative as the amount when
  // calculating the value with the value interpreter, this is also the rate.
  let one = BigInt.fromI32(10).pow(asset.decimals as u8);
  let address = Address.fromString(asset.id);
  let contract = ValueInterpreterContract.bind(valueInterpreter);
  let call = contract.try_calcCanonicalAssetValue(address, one, wethTokenAddress);
  let value = !call.reverted ? toBigDecimal(call.value) : BigDecimal.fromString('0');

  return value;
}

function fetchAssetPriceLegacy(asset: Asset, valueInterpreter: Address): BigDecimal {
  // NOTE: Because we are using one "unit" of the given derivative as the amount when
  // calculating the value with the value interpreter, this is also the rate.
  let one = BigInt.fromI32(10).pow(asset.decimals as u8);
  let address = Address.fromString(asset.id);
  let contract = ValueInterpreterLegacyContract.bind(valueInterpreter);
  let call = contract.try_calcCanonicalAssetValue(address, one, wethTokenAddress);
  let valid = !call.reverted && call.value.value1 == true;
  let value = valid ? toBigDecimal(call.value.value0) : BigDecimal.fromString('0');

  return value;
}
