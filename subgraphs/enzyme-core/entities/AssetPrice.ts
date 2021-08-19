import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { release2Addresses, release3Addresses, release4Addresses, wethTokenAddress } from '../generated/addresses';
import { Asset, AssetPrice } from '../generated/schema';
import { ValueInterpreter2Contract } from '../generated/ValueInterpreter2Contract';
import { ValueInterpreter3Contract } from '../generated/ValueInterpreter3Contract';
import { ValueInterpreter4Contract } from '../generated/ValueInterpreter4Contract';
import { useCurrentRelease } from './Release';

export function assetPriceId(asset: Asset, event: ethereum.Event): string {
  return asset.id + '/' + event.block.timestamp.toString();
}

export function ensureAssetPrice(asset: Asset, event: ethereum.Event): AssetPrice {
  let id = assetPriceId(asset, event);

  let assetPrice = AssetPrice.load(id) as AssetPrice;
  if (assetPrice) {
    return assetPrice;
  }

  let currentAssetPrice = getCurrentAssetPrice(asset);

  assetPrice = new AssetPrice(id);
  assetPrice.asset = asset.id;
  assetPrice.timestamp = event.block.timestamp;
  assetPrice.price = currentAssetPrice;
  assetPrice.save();

  return assetPrice;
}

export function getCurrentAssetPrice(asset: Asset): BigDecimal {
  let release = useCurrentRelease();

  // Release 2
  if (release.id == release2Addresses.fundDeployerAddress.toHex()) {
    let valueInterpreter = ValueInterpreter2Contract.bind(release2Addresses.valueInterpreterAddress);

    let baseAddress = Address.fromString(asset.id);
    let quoteAddress = wethTokenAddress;

    let amount = BigInt.fromI32(10).pow(asset.decimals as i8);

    let value = valueInterpreter.try_calcCanonicalAssetValue(baseAddress, amount, quoteAddress);

    if (value.reverted || value.value.value1 == false) {
      return BigDecimal.fromString('0');
    }

    return toBigDecimal(value.value.value0);
  }

  // Release 3
  if (release.id == release3Addresses.fundDeployerAddress.toHex()) {
    let valueInterpreter = ValueInterpreter3Contract.bind(release3Addresses.valueInterpreterAddress);

    let baseAddress = Address.fromString(asset.id);
    let quoteAddress = wethTokenAddress;

    let amount = BigInt.fromI32(10).pow(asset.decimals as i8);

    let value = valueInterpreter.try_calcCanonicalAssetValue(baseAddress, amount, quoteAddress);

    if (value.reverted || value.value.value1 == false) {
      return BigDecimal.fromString('0');
    }

    return toBigDecimal(value.value.value0);
  }

  // Release 4
  if (release.id == release4Addresses.fundDeployerAddress.toHex()) {
    let valueInterpreter = ValueInterpreter4Contract.bind(release4Addresses.valueInterpreterAddress);

    let baseAddress = Address.fromString(asset.id);
    let quoteAddress = wethTokenAddress;

    let amount = BigInt.fromI32(10).pow(asset.decimals as i8);

    let value = valueInterpreter.try_calcCanonicalAssetValue(baseAddress, amount, quoteAddress);

    if (value.reverted) {
      return BigDecimal.fromString('0');
    }

    return toBigDecimal(value.value);
  }

  return BigDecimal.fromString('0');
}
