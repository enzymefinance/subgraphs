import { arrayDiff } from '@enzymefinance/subgraph-utils';
import {
  CallbackContractSet,
  ClaimableCollateralAdded,
  TrackedAssetAdded,
  TrackedAssetsCleared,
  TrackedMarketAdded,
  TrackedMarketRemoved,
} from '../../generated/contracts/GMXV2LeverageTradingPositionLib4Events';
import { useGMXV2LeverageTradingPosition } from '../../entities/GMXV2LeverageTradingPosition';

export function handleCallbackContractSet(event: CallbackContractSet): void {}

export function handleClaimableCollateralAdded(event: ClaimableCollateralAdded): void {}

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let position = useGMXV2LeverageTradingPosition(event.address.toHex());
  position.trackedAssets = position.trackedAssets.concat([event.params.asset.toHex()]);
  position.save();
}

export function handleTrackedAssetsCleared(event: TrackedAssetsCleared): void {
  let position = useGMXV2LeverageTradingPosition(event.address.toHex());
  position.trackedAssets = [];
  position.save();
}

export function handleTrackedMarketAdded(event: TrackedMarketAdded): void {
  let position = useGMXV2LeverageTradingPosition(event.address.toHex());
  position.trackedMarkets = position.trackedMarkets.concat([event.params.market]);
  position.save();
}

export function handleTrackedMarketRemoved(event: TrackedMarketRemoved): void {
  let position = useGMXV2LeverageTradingPosition(event.address.toHex());
  position.trackedMarkets = arrayDiff(position.trackedMarkets, [event.params.market]);
  position.save();
}
