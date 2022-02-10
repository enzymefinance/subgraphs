import { ethereum } from '@graphprotocol/graph-ts';
import { Network } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export let networkId = 'ENZYME';

export function createNetwork(event: ethereum.Event): Network {

  let network = new Network(networkId);
  network.timestamp = event.block.timestamp;
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
