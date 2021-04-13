import { ethereum } from '@graphprotocol/graph-ts';
import { NetworkState } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { getDayOpenTime } from '../utils/timeHelpers';
import { ensureNetwork, networkId } from './Network';

export function networkStateId(event: ethereum.Event): string {
  let startOfDay = getDayOpenTime(event.block.timestamp);
  return networkId + '/' + startOfDay.toString();
}

export function createNetworkState(
  assetHoldings: string[],
  funds: number,
  managers: number,
  investors: number,
  investments: number,
  event: ethereum.Event,
): NetworkState {
  let state = new NetworkState(networkStateId(event));
  state.timestamp = event.block.timestamp;
  state.network = networkId;
  state.assetHoldings = assetHoldings;
  state.funds = funds as i32;
  state.managers = managers as i32;
  state.investors = investors as i32;
  state.investments = investments as i32;
  state.save();

  return state;
}

export function useNetworkState(id: string): NetworkState {
  let network = NetworkState.load(id);
  if (network == null) {
    logCritical('Failed to load network state.', [id]);
  }

  return network as NetworkState;
}

export function ensureNetworkState(event: ethereum.Event): NetworkState {
  let current = NetworkState.load(networkStateId(event)) as NetworkState;
  if (current) {
    return current;
  }

  // network state doesn't exist, create new state by porting over all records/data
  let network = ensureNetwork(event);
  let previous = useNetworkState(network.state);

  let state = createNetworkState(
    previous.assetHoldings,
    previous.funds,
    previous.managers,
    previous.investors,
    previous.investments,
    event,
  );

  network.state = state.id;
  network.save();

  return state;
}

export function trackNetworkFunds(event: ethereum.Event): void {
  let state = ensureNetworkState(event);

  state.funds = state.funds + 1;
  state.save();

  let network = ensureNetwork(event);
  network.state = state.id;
  network.save();
}

export function trackNetworkManagers(event: ethereum.Event): void {
  let state = ensureNetworkState(event);

  state.managers = state.managers + 1;
  state.save();

  let network = ensureNetwork(event);
  network.state = state.id;
  network.save();
}

export function trackNetworkInvestors(event: ethereum.Event): void {
  let state = ensureNetworkState(event);

  state.investors = state.investors + 1;
  state.save();

  let network = ensureNetwork(event);
  network.state = state.id;
  network.save();
}

export function trackNetworkInvestments(event: ethereum.Event): void {
  let state = ensureNetworkState(event);

  state.investments = state.investments + 1;
  state.save();

  let network = ensureNetwork(event);
  network.state = state.id;
  network.save();
}
