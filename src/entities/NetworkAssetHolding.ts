import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Asset, HoldingState, NetworkAssetHolding } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { getDayOpenTime, isSameDay } from '../utils/timeHelpers';
import { ensureAsset } from './Asset';
import { ensureNetwork, networkId } from './Network';
import { ensureNetworkState } from './NetworkState';

function networkAssetHoldingId(asset: Asset, event: ethereum.Event): string {
  let startOfDay = getDayOpenTime(event.block.timestamp);
  return networkId + '/' + asset.id + '/' + startOfDay.toString();
}

export function createNetworkAssetHolding(
  asset: Asset,
  amount: BigDecimal,
  event: ethereum.Event,
): NetworkAssetHolding {
  let holding = new NetworkAssetHolding(networkAssetHoldingId(asset, event));
  holding.timestamp = event.block.timestamp;
  holding.asset = asset.id;
  holding.amount = amount;
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
    let asset = ensureAsset(Address.fromString(holdingState.asset));
    let currentNetworkAssetHolding = NetworkAssetHolding.load(asset.networkAssetHolding || '');

    // no match: this should not happen
    if (currentNetworkAssetHolding == null) {
      logCritical('NetworkAssetHolding for asset {} not found.', [asset.id]);
      continue;
    }

    let amount = currentNetworkAssetHolding.amount.minus(holdingState.amount);

    // match from today: update current record
    if (isSameDay(currentNetworkAssetHolding.timestamp, event.block.timestamp)) {
      currentNetworkAssetHolding.timestamp = event.block.timestamp;
      currentNetworkAssetHolding.amount = amount;
      currentNetworkAssetHolding.save();
      continue;
    }

    // match from previous day: copy and update
    let newRecord = createNetworkAssetHolding(asset, amount, event);

    asset.networkAssetHolding = newRecord.id;
    asset.save();

    nextAssetHoldings = arrayDiff<string>(nextAssetHoldings, [currentNetworkAssetHolding.id]);
    nextAssetHoldings = arrayUnique<string>(nextAssetHoldings.concat([newRecord.id]));
  }

  // loop through next holdings, add to network holdings
  for (let i = 0; i < next.length; i++) {
    let holdingState = next[i];
    let asset = ensureAsset(Address.fromString(holdingState.asset));
    let currentNetworkAssetHolding = NetworkAssetHolding.load(asset.networkAssetHolding || '');

    // no match: create new record
    if (currentNetworkAssetHolding == null) {
      let newRecord = createNetworkAssetHolding(asset, holdingState.amount, event);

      asset.networkAssetHolding = newRecord.id;
      asset.save();

      nextAssetHoldings = arrayUnique<string>(nextAssetHoldings.concat([newRecord.id]));
      continue;
    }

    let amount = currentNetworkAssetHolding.amount.plus(holdingState.amount);

    // match from today: update current record
    if (isSameDay(currentNetworkAssetHolding.timestamp, event.block.timestamp)) {
      currentNetworkAssetHolding.timestamp = event.block.timestamp;
      currentNetworkAssetHolding.amount = amount;
      currentNetworkAssetHolding.save();
      continue;
    }

    // match from previous day: copy and update
    let newRecord = createNetworkAssetHolding(asset, amount, event);

    asset.networkAssetHolding = newRecord.id;
    asset.save();

    nextAssetHoldings = arrayDiff<string>(nextAssetHoldings, [currentNetworkAssetHolding.id]);
    nextAssetHoldings = arrayUnique<string>(nextAssetHoldings.concat([newRecord.id]));
  }

  state.assetHoldings = nextAssetHoldings;
  state.save();

  let network = ensureNetwork(event);
  network.state = state.id;
  network.save();
}
