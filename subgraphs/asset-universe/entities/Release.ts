import { Address } from '@graphprotocol/graph-ts';
import { Release } from '../generated/schema';
import { getReleaseCounter } from './Counter';

export function getOrCreateRelease(address: Address): Release {
  let id = address.toHex();
  let release = Release.load(id);
  if (release == null) {
    release = new Release(id);
    release.counter = getReleaseCounter();
    release.save();
  }

  return release;
}
