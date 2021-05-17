import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { ValueInterpreterContract } from '../../generated/ValueInterpreterContract';
import { Asset } from '../../generated/schema';

export function fetchAssetPrice(asset: Asset, valueInterpreter: Address): BigDecimal {
  let contract = ValueInterpreterContract.bind(valueInterpreter);

  // NOTE: Because we are using one "unit" of the given derivative as the amount when
  // calculating the value with the value interpreter, this is also the rate.
  let one = BigInt.fromI32(10).pow(asset.decimals as u8);
  let address = Address.fromString(asset.id);
  let call = contract.try_calcCanonicalAssetValue(address, one, wethTokenAddress);

  let valid = !call.reverted && call.value.value1 == true;
  let value = valid ? toBigDecimal(call.value.value0) : BigDecimal.fromString('0');

  return value;
}
