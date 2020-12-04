import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Asset, HoldingState, NetworkAssetHolding } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { getDayOpenTime, isSameDay } from '../utils/timeHelpers';
import { useAsset } from './Asset';
import { networkId, useNetwork } from './Network';
import { ensureNetworkState } from './NetworkState';

function networkAssetHoldingId(asset: Asset, event: ethereum.Event): string {
  let startOfDay = getDayOpenTime(event.block.timestamp);
  return networkId + '/' + asset.id + '/' + startOfDay.toString();
}

export function createNetworkAssetHolding(
  asset: Asset,
  quantity: BigDecimal,
  event: ethereum.Event,
): NetworkAssetHolding {
  let holding = new NetworkAssetHolding(networkAssetHoldingId(asset, event));
  holding.timestamp = event.block.timestamp;
  holding.asset = asset.id;
  holding.quantity = quantity;
  holding.save();

  return holding;
}

export function useNetworkAssetHolding(id: string): NetworkAssetHolding {
  let holding = NetworkAssetHolding.load(id);
  if (holding == null) {
    logCritical('Failed to load network asset holding.', [id]);
  }

  return holding as NetworkAssetHolding;
}

export function trackNetworkAssetHoldings(prev: HoldingState[], next: HoldingState[], event: ethereum.Event): void {
  let state = ensureNetworkState(event);

  let previousAssetHoldings = state.assetHoldings.map<string>((id) => useNetworkAssetHolding(id).id);
  let nextAssetHoldings = previousAssetHoldings;

  // loop through prev holdings, subtract from network holdings
  for (let i = 0; i < prev.length; i++) {
    let holdingState = prev[i];
    let asset = useAsset(holdingState.asset);
    let match = findNetworkAssetHolding(nextAssetHoldings, asset);

    // no match: this should not happen
    if (match == null) {
      logCritical('NetworkAssetHolding for asset {} not found.', [asset.id]);
      continue;
    }

    let quantity = match.quantity.minus(holdingState.quantity);

    // match from today: update current record
    if (isSameDay(match.timestamp, event.block.timestamp)) {
      match.timestamp = event.block.timestamp;
      match.quantity = quantity;
      match.save();
      continue;
    }

    // match from previous day: copy and update
    let newRecord = createNetworkAssetHolding(asset, quantity, event);

    nextAssetHoldings = arrayDiff<string>(nextAssetHoldings, [match.id]);
    nextAssetHoldings = arrayUnique<string>(nextAssetHoldings.concat([newRecord.id]));
  }

  // loop through next holdings, add to network holdings
  for (let i = 0; i < next.length; i++) {
    let holdingState = next[i];
    let asset = useAsset(holdingState.asset);
    let match = findNetworkAssetHolding(nextAssetHoldings, asset);

    // no match: create new record
    if (match == null) {
      let newRecord = createNetworkAssetHolding(asset, holdingState.quantity, event);

      nextAssetHoldings = arrayUnique<string>(nextAssetHoldings.concat([newRecord.id]));
      continue;
    }

    let quantity = match.quantity.plus(holdingState.quantity);

    // match from today: update current record
    if (isSameDay(match.timestamp, event.block.timestamp)) {
      match.timestamp = event.block.timestamp;
      match.quantity = quantity;
      match.save();
      continue;
    }

    // match from previous day: copy and update
    let newRecord = createNetworkAssetHolding(asset, quantity, event);

    nextAssetHoldings = arrayDiff<string>(nextAssetHoldings, [match.id]);
    nextAssetHoldings = arrayUnique<string>(nextAssetHoldings.concat([newRecord.id]));
  }

  state.assetHoldings = nextAssetHoldings;
  state.save();

  let network = useNetwork();
  network.state = state.id;
  network.save();
}

export function findNetworkAssetHolding(assetHoldingIds: string[], asset: Asset): NetworkAssetHolding | null {
  for (let i: i32 = 0; i < assetHoldingIds.length; i++) {
    let assetHolding = useNetworkAssetHolding(assetHoldingIds[i]);
    if (assetHolding.asset == asset.id) {
      return assetHolding;
    }
  }

  return null;
}
