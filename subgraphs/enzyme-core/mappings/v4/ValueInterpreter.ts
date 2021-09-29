import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from '../../entities/Asset';
import { getActivityCounter } from '../../entities/Counter';
import { release4Addresses } from '../../generated/addresses';
import {
  DerivativeAdded,
  DerivativeRemoved,
  EthUsdAggregatorSet,
  PrimitiveAdded,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
  StaleRateThresholdSet,
} from '../../generated/contracts/ValueInterpreter4Events';
import { AssetAdded, AssetRemoved } from '../../generated/schema';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let asset = ensureAsset(event.params.derivative);

  let activity = new AssetAdded(uniqueEventId(event, 'AssetAdded'));
  activity.timestamp = event.block.timestamp.toI32();
  activity.asset = asset.id;
  activity.release = release4Addresses.fundDeployerAddress.toHex();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Network'];
  activity.activityType = 'Assets';
  activity.save();
}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let asset = ensureAsset(event.params.primitive);

  let activity = new AssetAdded(uniqueEventId(event, 'AssetAdded'));
  activity.timestamp = event.block.timestamp.toI32();
  activity.asset = asset.id;
  activity.release = release4Addresses.fundDeployerAddress.toHex();
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
  activity.release = release4Addresses.fundDeployerAddress.toHex();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Network'];
  activity.activityType = 'Assets';
  activity.save();
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let asset = ensureAsset(event.params.primitive);

  let activity = new AssetRemoved(uniqueEventId(event, 'AssetRemoved'));
  activity.timestamp = event.block.timestamp.toI32();
  activity.asset = asset.id;
  activity.release = release4Addresses.fundDeployerAddress.toHex();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Network'];
  activity.activityType = 'Assets';
  activity.save();
}

export function handleEthUsdAggregatorSet(event: EthUsdAggregatorSet): void {}
export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {}
export function handleStaleRateThresholdSet(event: StaleRateThresholdSet): void {}
