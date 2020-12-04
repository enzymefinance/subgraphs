import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { NetworkState } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { getDayOpenTime } from '../utils/timeHelpers';
import { networkId, useNetwork } from './Network';

export function networkStateId(event: ethereum.Event): string {
  let startOfDay = getDayOpenTime(event.block.timestamp);
  return networkId + '/' + startOfDay.toString();
}

export function createNetworkState(
  assetHoldings: string[],
  numberOfFunds: BigInt,
  event: ethereum.Event,
): NetworkState {
  let state = new NetworkState(networkStateId(event));
  state.timestamp = event.block.timestamp;
  state.network = networkId;
  state.assetHoldings = assetHoldings;
  state.numberOfFunds = numberOfFunds;
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
  let network = useNetwork();
  let previous = useNetworkState(network.state);

  let state = createNetworkState(previous.assetHoldings, previous.numberOfFunds, event);

  network.state = state.id;
  network.save();

  // link fund states to period states
  //   trackHourlyFundState(fund, state, event);
  //   trackDailyFundState(fund, state, event);
  //   trackMonthlyFundState(fund, state, event);

  return state;
}

export function trackNetworkNumberOfFunds(event: ethereum.Event): void {
  let state = ensureNetworkState(event);

  state.numberOfFunds = state.numberOfFunds.plus(BigInt.fromI32(1));
  state.save();

  let network = useNetwork();
  network.state = state.id;
  network.save();
}
