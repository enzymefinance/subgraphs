import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from '../../entities/Asset';
import { getActivityCounter } from '../../entities/Counter';
import { release3Addresses } from '../../generated/addresses';
import {
  DerivativeAdded,
  DerivativeRemoved,
  DerivativeUpdated,
} from '../../generated/contracts/AggregatedDerivativePriceFeed3Events';
import { AssetAdded, AssetRemoved } from '../../generated/schema';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let asset = ensureAsset(event.params.derivative);

  let activity = new AssetAdded(uniqueEventId(event, 'AssetAdded'));
  activity.timestamp = event.block.timestamp.toI32();
  activity.asset = asset.id;
  activity.release = release3Addresses.fundDeployerAddress.toHex();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Network'];
  activity.activityType = 'Assets';
  activity.save();
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  let asset = ensureAsset(event.params.derivative);

  let activity = new AssetRemoved(uniqueEventId(event, 'AssetRemoved'));
  activity.timestamp = event.block.timestamp.toI32();
  activity.asset = asset.id;
  activity.release = release3Addresses.fundDeployerAddress.toHex();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Network'];
  activity.activityType = 'Assets';
  activity.save();
}

export function handleDerivativeUpdated(event: DerivativeUpdated): void {}
