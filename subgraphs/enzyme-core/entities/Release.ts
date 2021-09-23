import { logCritical } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Release } from '../generated/schema';
import { networkId, useNetwork } from './Network';

export function createRelease(address: Address, event: ethereum.Event): Release {
  let release = new Release(address.toHex());
  release.isLive = false;
  release.current = true;
  release.open = event.block.timestamp.toI32();
  release.network = networkId;
  release.save();

  return release;
}

export function ensureRelease(address: Address, event: ethereum.Event): Release {
  let release = Release.load(address.toHex());
  if (release != null) {
    return release as Release;
  }

  return createRelease(address, event);
}

export function useCurrentRelease(): Release {
  let network = useNetwork();
  if (network.currentRelease == null) {
    logCritical('Network {} does not have a current release', [networkId]);
  }

  let release = Release.load(network.currentRelease as string);
  if (release == null) {
    logCritical('Release {} does not exist', [network.currentRelease as string]);
  }

  return release as Release;
}
