import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from '../../entities/Asset';
import { getActivityCounter } from '../../entities/Counter';
import { release2Addresses } from '../../generated/addresses';
import {
  EthUsdAggregatorSet,
  PrimitiveAdded,
  PrimitiveRemoved,
  PrimitiveUpdated,
} from '../../generated/contracts/ChainlinkPriceFeed2Events';
import { AssetAdded, AssetRemoved } from '../../generated/schema';

export function handleEthUsdAggregatorSet(event: EthUsdAggregatorSet): void {}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let asset = ensureAsset(event.params.primitive);

  let activity = new AssetAdded(uniqueEventId(event, 'AssetAdded'));
  activity.timestamp = event.block.timestamp.toI32();
  activity.asset = asset.id;
  activity.release = release2Addresses.fundDeployerAddress.toHex();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Network'];
  activity.activityType = 'NetworkSettings';
  activity.save();
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let asset = ensureAsset(event.params.primitive);

  let activity = new AssetRemoved(uniqueEventId(event, 'AssetRemoved'));
  activity.timestamp = event.block.timestamp.toI32();
  activity.asset = asset.id;
  activity.release = release2Addresses.fundDeployerAddress.toHex();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Network'];
  activity.activityType = 'NetworkSettings';
  activity.save();
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {}
