import { Address } from '@graphprotocol/graph-ts';
import { Asset, PriceFeed } from '../generated/schema';

export function ensurePriceFeed(priceFeedAddress: Address, asset: Asset): PriceFeed {
  let priceFeed = PriceFeed.load(priceFeedAddress.toHex()) as PriceFeed;
  if (priceFeed) {
    return priceFeed;
  }

  priceFeed = new PriceFeed(priceFeedAddress.toHex());
  priceFeed.current = false;
  priceFeed.asset = asset.id;

  return priceFeed;
}
