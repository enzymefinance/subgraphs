import { PriceFeedSet } from '../generated/AggregatedDerivativePriceFeedContract';
import { DerivativePriceFeedSet } from '../generated/schema';
import { genericId } from '../utils/genericId';
import { useAsset, ensureAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
import { ensurePriceFeed } from '../entities/PriceFeed';
import { ensureTransaction } from '../entities/Transaction';
import { zeroAddress } from '../constants';

export function handlePriceFeedSet(event: PriceFeedSet): void {
  let derivativePriceFeedSet = new DerivativePriceFeedSet(genericId(event));
  let nextPriceFeed = ensurePriceFeed(event.params.nextPriceFeed);

  let derivative = ensureAsset(event.params.derivative);

  // Specify that our Asset instance is a derivative
  derivative.isDerivative = true;

  // TODO: Find out what the derivative is derived from & assign it
  // primitive =
  // derivative.derivedFrom =

  // Assign our derivative its new price feed
  derivative.currentPriceFeed = nextPriceFeed.id;
  derivative.save();

  if (!event.params.prevPriceFeed.equals(zeroAddress)) {
    let prevPriceFeed = ensurePriceFeed(event.params.prevPriceFeed);
    // Check if the price feed is already listed for the asset

    prevPriceFeed.asset.push(derivative.id);
    /*     prevPriceFeed.current = false;
    prevPriceFeed.currentEnd = event.block.timestamp; */
    prevPriceFeed.save();

    derivativePriceFeedSet.prevPriceFeed = prevPriceFeed.id;
  }

  nextPriceFeed.asset.push(derivative);
  nextPriceFeed.save();

  derivativePriceFeedSet.derivative = derivative.id;
  derivativePriceFeedSet.nextPriceFeed = nextPriceFeed.id;
  derivativePriceFeedSet.contract = ensureContract(
    event.address,
    'AggregatedDerivativePriceFeed',
    event.block.timestamp,
  ).id;
  derivativePriceFeedSet.timestamp = event.block.timestamp;
  derivativePriceFeedSet.transaction = ensureTransaction(event).id;

  derivativePriceFeedSet.save();
}
