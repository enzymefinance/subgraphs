import { ethereum } from '@graphprotocol/graph-ts';
import { Asset } from '../generated/schema';

export function assetPriceId(asset: Asset, event: ethereum.Event): string {
  return asset.id + '/' + event.block.timestamp.toString();
}
