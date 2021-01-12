import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Release } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { networkId } from './Network';

export function useRelease(id: string): Release {
  let release = Release.load(id) as Release;
  if (release == null) {
    logCritical('Failed to load release {}.', [id]);
  }

  return release;
}

export function createRelease(address: Address, event: ethereum.Event): Release {
  let release = new Release(address.toHex());
  release.current = true;
  release.open = event.block.timestamp;
  release.network = networkId;
  release.save();

  return release;
}

export function ensureRelease(id: string, event: ethereum.Event): Release {
  let release = Release.load(id) as Release;

  if (release != null) {
    return release;
  }

  return createRelease(Address.fromString(id), event);
}
