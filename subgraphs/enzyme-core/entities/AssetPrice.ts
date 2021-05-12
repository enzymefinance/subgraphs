import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { Asset, AssetPrice } from '../generated/schema';
import { ValueInterpreterContract } from '../generated/ValueInterpreterContract';
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
  assetPrice.price = currentAssetPrice.price;
  assetPrice.valid = currentAssetPrice.valid;
  assetPrice.save();

  return assetPrice;
}

export class AssetPriceReturnValue {
  price: BigDecimal;
  valid: boolean;
}

export function getCurrentAssetPrice(asset: Asset): AssetPriceReturnValue {
  let release = useCurrentRelease();

  let valueInterpreter = ValueInterpreterContract.bind(Address.fromString(release.valueInterpreter));

  let baseAddress = Address.fromString(asset.id);
  let quoteAddress = Address.fromString(release.wethToken);

  let amount = BigInt.fromI32(10).pow(asset.decimals as i8);

  let value = valueInterpreter.try_calcCanonicalAssetValue(baseAddress, amount, quoteAddress);

  if (value.reverted || value.value.value1 == false) {
    return { price: BigDecimal.fromString('0'), valid: false };
  }

  return { price: toBigDecimal(value.value.value0), valid: true };
}
