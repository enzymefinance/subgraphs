import { Address, BigInt, BigDecimal, log, dataSource } from '@graphprotocol/graph-ts';
import { toBigDecimal, ZERO_ADDRESS, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { SharedSdk } from '../generated/contracts/SharedSdk';
import { Asset } from '../generated/schema';
import {
  releaseV4Address,
  releaseV3Address,
  releaseV2Address,
  valueInterpreterV2Address,
  valueInterpreterV3Address,
  valueInterpreterV4Address,
  wethTokenAddress,
} from '../generated/configuration';

export function fetchAssetPrice(asset: Asset, version: Address): BigDecimal {
  if (version == ZERO_ADDRESS) {
    log.warning('Unknown release version', []);
    return ZERO_BD;
  }

  let networkName = dataSource.network();
  if (networkName == 'mainnet') {
    if (version == releaseV2Address) {
      return fetchAssetPriceLegacy(asset, valueInterpreterV2Address);
    } else if (version == releaseV3Address) {
      return fetchAssetPriceLegacy(asset, valueInterpreterV3Address);
    } else if (version == releaseV4Address) {
      return fetchAssetPriceNew(asset, valueInterpreterV4Address);
    } else {
      log.warning('Unsupported release version {}', [version.toHex()]);
      return ZERO_BD;
    }
  }

  log.warning('Unsupported network {}', [networkName]);
  return ZERO_BD;
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
