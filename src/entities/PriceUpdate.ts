import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { PriceSource, Asset, PriceUpdate, AssetPrice } from '../generated/schema';
import { Context } from '../context';
import { logCritical } from '../utils/logCritical';

function priceSourceId(priceSourceAddress: Address): string {
  return priceSourceAddress.toHex();
}

export function ensurePriceSource(priceSourceAddress: Address, context: Context): PriceSource {
  let id = priceSourceId(priceSourceAddress);
  let priceSource = PriceSource.load(id) as PriceSource;
  if (priceSource) {
    return priceSource;
  }

  priceSource = createPriceSource(priceSourceAddress, context);

  return priceSource;
}

export function createPriceSource(priceSourceAddress: Address, context: Context): PriceSource {
  let id = priceSourceId(priceSourceAddress);

  if (PriceSource.load(id)) {
    logCritical('Duplicate price source "{}".', [id]);
  }

  let priceSource = new PriceSource(id);
  priceSource.save();

  return priceSource;
}

function priceUpdateId(priceSource: PriceSource, event: ethereum.Event): string {
  return priceSource.id + '/' + event.block.timestamp.toString();
}

export function createPriceUpdate(
  priceSource: PriceSource,
  assets: Asset[],
  prices: BigDecimal[],
  context: Context,
): PriceUpdate {
  let id = priceUpdateId(priceSource, context.event);

  if (PriceUpdate.load(id)) {
    return PriceUpdate.load(id) as PriceUpdate;
  }

  let priceUpdate = new PriceUpdate(id);
  priceUpdate.timestamp = context.event.block.timestamp;

  let assetPrices: AssetPrice[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    assetPrices.push(createAssetPrice(priceSource, assets[i], prices[i], context));
  }
  priceUpdate.assetPrices = assetPrices.map<string>((assetPrice) => assetPrice.id);

  priceUpdate.save();
  return priceUpdate;
}

function assetPriceId(priceSource: PriceSource, asset: Asset, event: ethereum.Event): string {
  return priceSource.id + '/' + asset.id + '/' + event.block.timestamp.toString();
}

export function createAssetPrice(
  priceSource: PriceSource,
  asset: Asset,
  price: BigDecimal,
  context: Context,
): AssetPrice {
  let id = assetPriceId(priceSource, asset, context.event);

  if (AssetPrice.load(id)) {
    return AssetPrice.load(id) as AssetPrice;
  }

  let assetPrice = new AssetPrice(id);
  assetPrice.timestamp = context.event.block.timestamp;
  assetPrice.asset = asset.id;
  assetPrice.price = price;
  assetPrice.save();

  return assetPrice;
}
