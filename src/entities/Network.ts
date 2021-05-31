import { ethereum } from '@graphprotocol/graph-ts';
import { Network } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { createNetworkState } from './NetworkState';

export let networkId = 'ENZYME';

export function createNetwork(event: ethereum.Event): Network {
  let state = createNetworkState([], 0, 0, 0, 0, event);

  let network = new Network(networkId);
  network.timestamp = event.block.timestamp;
  network.state = state.id;
  network.save();

  return network;
}

export function ensureNetwork(event: ethereum.Event): Network {
  let network = Network.load(networkId) as Network;

  if (network != null) {
    return network;
  }

  return createNetwork(event);
}

export function useNetwork(): Network {
  let network = Network.load(networkId) as Network;

  if (network == null) {
    logCritical('Network {} does not exist', [networkId]);
  }
  return network;
}
