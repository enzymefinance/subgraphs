import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { uniqueSortableEventId, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Asset, AssetPrice } from '../generated/schema';
import { fetchAssetPrice } from '../utils/fetchAssetPrice';

function assetPriceId(asset: Asset, event: ethereum.Event): string {
  return asset.id + '/' + event.block.number.toString();
}

export function updateAssetPrice(asset: Asset, price: BigDecimal, event: ethereum.Event): AssetPrice {
  let id = assetPriceId(asset, event);
  let entity = new AssetPrice(id);
  entity.incremental = uniqueSortableEventId(event);
  entity.asset = asset.id;
  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp;
  entity.price = price;
  entity.save();

  if (asset.price != entity.id) {
    asset.price = entity.id;
    asset.save();
  }

  return entity;
}

export function updateAssetPriceWithValueInterpreter(asset: Asset, interpreter: Address, event: ethereum.Event): void {
  // Skip the update if there has already been a non-zero update for this asset in this block.
  let latest = getLatestAssetPrice(asset);
  if (latest != null && latest.block.equals(event.block.number) && !latest.price.equals(ZERO_BD)) {
    return;
  }

  let value = fetchAssetPrice(asset, interpreter);
  updateAssetPrice(asset, value, event);
}

export function getLatestAssetPrice(asset: Asset): AssetPrice | null {
  if (asset.price == '') {
    return null;
  }

  return AssetPrice.load(asset.price);
}
