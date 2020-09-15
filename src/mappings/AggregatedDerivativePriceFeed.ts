import {
  PriceFeedSet,
  AggregatedDerivativePriceFeedContract,
} from '../generated/AggregatedDerivativePriceFeedContract';
import { PriceFeedSetEvent } from '../generated/schema';
import { genericId } from '../utils/genericId';
import { ensureAsset } from '../entities/Asset';
import { Address } from '@graphprotocol/graph-ts';
import { ensureContract } from '../entities/Contract';
import { ensurePriceFeed } from '../entities/PriceFeed';
import { ensureTransaction } from '../entities/Transaction';
import { zeroAddress } from '../constants';
import { arrayUnique } from '../utils/arrayUnique';

export function handlePriceFeedSet(event: PriceFeedSet): void {
  let derivativePriceFeedSet = new PriceFeedSetEvent(genericId(event));
  let nextPriceFeed = ensurePriceFeed(event.params.nextPriceFeed);

  let derivative = ensureAsset(event.params.derivative);

  // Specify that our Asset instance is a derivative
  derivative.isDerivative = true;

  // Find out what the derivative is derived from & assign it
  let contract = AggregatedDerivativePriceFeedContract.bind(event.address);
  let primitivesArray = contract.getRatesToUnderlyings(Address.fromString(derivative.id)).value0;

  derivative.derivedFrom = primitivesArray.map<string>((address) => address.toHex());

  // Assign our derivative its new price feed
  derivative.priceFeed = nextPriceFeed.id;
  derivative.save();

  if (!event.params.prevPriceFeed.equals(zeroAddress)) {
    let prevPriceFeed = ensurePriceFeed(event.params.prevPriceFeed);

    // Only add asset to pricefeed.asset array if it isn't there already
    prevPriceFeed.assets = arrayUnique<string>(prevPriceFeed.assets.concat([derivative.id]));

    prevPriceFeed.save();
    derivativePriceFeedSet.prevPriceFeed = prevPriceFeed.id;
  }

  // Only add asset to pricefeed.asset array if it isn't there already
  nextPriceFeed.assets = arrayUnique<string>(nextPriceFeed.assets.concat([derivative.id]));
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
