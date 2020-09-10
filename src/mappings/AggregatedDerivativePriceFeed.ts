import {
  PriceFeedSet,
  AggregatedDerivativePriceFeedContract,
} from '../generated/AggregatedDerivativePriceFeedContract';
import { DerivativePriceFeedSet } from '../generated/schema';
import { genericId } from '../utils/genericId';
import { useAsset, ensureAsset } from '../entities/Asset';
import { Address } from '@graphprotocol/graph-ts';
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

  // Find out what the derivative is derived from & assign it
  let contract = AggregatedDerivativePriceFeedContract.bind(event.address);
  let primitivesArray = contract.getRatesToUnderlyings(Address.fromString(derivative.id)).value0;
  let primitivesStringArray = new Array<string>(primitivesArray.length);
  for (let i = 0; i < primitivesArray.length; ++i) {
    primitivesStringArray[i] = primitivesArray[i].toString();
  }
  derivative.derivedFrom = primitivesStringArray;

  // Assign our derivative its new price feed
  derivative.currentPriceFeed = nextPriceFeed.id;
  derivative.save();

  if (!event.params.prevPriceFeed.equals(zeroAddress)) {
    let prevPriceFeed = ensurePriceFeed(event.params.prevPriceFeed);

    // Only add asset to pricefeed if it isn't already in the pricefeed asset array
    if (prevPriceFeed.asset.indexOf(derivative.id) === -1) {
      prevPriceFeed.asset.push(derivative.id);
    }

    prevPriceFeed.save();
    derivativePriceFeedSet.prevPriceFeed = prevPriceFeed.id;
  }

  // Only add asset to pricefeed if it isn't already in the pricefeed asset array
  if (nextPriceFeed.asset.indexOf(derivative.id) === -1) {
    nextPriceFeed.asset.push(derivative.id);
  }
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
