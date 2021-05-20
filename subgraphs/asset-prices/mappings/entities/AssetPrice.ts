import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { uniqueSortableEventId } from '@enzymefinance/subgraph-utils';
import { Asset, AssetPrice } from '../../generated/schema';

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

export function getLatestAssetPrice(asset: Asset): AssetPrice | null {
  if (asset.price == '') {
    return null;
  }

  return AssetPrice.load(asset.price);
}
