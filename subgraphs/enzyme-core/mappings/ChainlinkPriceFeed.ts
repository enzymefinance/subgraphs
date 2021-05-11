import { uniqueEventId } from '../../../utils/utils/id';
import { ensureAsset } from '../entities/Asset';
import { ensureTransaction } from '../entities/Transaction';
import {
  EthUsdAggregatorSet,
  PrimitiveAdded,
  PrimitiveRemoved,
  PrimitiveUpdated,
} from '../generated/ChainlinkPriceFeedContract';
import {
  AggregatorUpdatedEvent,
  EthUsdAggregatorSetEvent,
  PrimitiveAddedEvent,
  PrimitiveRemovedEvent,
} from '../generated/schema';

export function handleEthUsdAggregatorSet(event: EthUsdAggregatorSet): void {
  let ethUsdAggregatorSet = new EthUsdAggregatorSetEvent(uniqueEventId(event));
  ethUsdAggregatorSet.timestamp = event.block.timestamp;
  ethUsdAggregatorSet.transaction = ensureTransaction(event).id;
  ethUsdAggregatorSet.prevEthUsdAggregator = event.params.prevEthUsdAggregator.toHex();
  ethUsdAggregatorSet.nextEthUsdAggregator = event.params.nextEthUsdAggregator.toHex();
  ethUsdAggregatorSet.save();
}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let primitive = ensureAsset(event.params.primitive);
  primitive.removed = false;
  primitive.type = event.params.rateAsset == 1 ? 'USD' : 'ETH';
  primitive.save();

  let primitivePriceFeedAdded = new PrimitiveAddedEvent(uniqueEventId(event));
  primitivePriceFeedAdded.primitive = primitive.id;
  primitivePriceFeedAdded.timestamp = event.block.timestamp;
  primitivePriceFeedAdded.transaction = ensureTransaction(event).id;
  primitivePriceFeedAdded.priceFeed = event.params.aggregator.toHex();
  primitivePriceFeedAdded.rateAsset = event.params.rateAsset;
  primitivePriceFeedAdded.save();
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let primitive = ensureAsset(event.params.primitive);
  primitive.removed = true;
  primitive.save();

  let primitivePriceFeedRemoved = new PrimitiveRemovedEvent(uniqueEventId(event));
  primitivePriceFeedRemoved.primitive = primitive.id;
  primitivePriceFeedRemoved.timestamp = event.block.timestamp;
  primitivePriceFeedRemoved.transaction = ensureTransaction(event).id;
  primitivePriceFeedRemoved.save();
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {
  let primitive = ensureAsset(event.params.primitive);

  let primitiveUpdated = new AggregatorUpdatedEvent(uniqueEventId(event));
  primitiveUpdated.timestamp = event.block.timestamp;
  primitiveUpdated.transaction = ensureTransaction(event).id;
  primitiveUpdated.primitive = primitive.id;
  primitiveUpdated.prevAggregator = event.params.prevAggregator.toHex();
  primitiveUpdated.nextAggregator = event.params.nextAggregator.toHex();
  primitiveUpdated.save();
}
