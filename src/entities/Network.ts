import { ethereum } from '@graphprotocol/graph-ts';
import { Network } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { createNetworkState } from './NetworkState';

export let networkId = 'ENZYME';

export function createNetwork(event: ethereum.Event): Network {
  let state = createNetworkState([], event);

  let network = new Network(networkId);
  network.timestamp = event.block.timestamp;
  network.state = state.id;
  network.save();

  return network;
}

export function useNetwork(): Network {
  let network = Network.load(networkId);
  if (network == null) {
    logCritical('Failed to load network.', []);
  }

  return network as Network;
}
