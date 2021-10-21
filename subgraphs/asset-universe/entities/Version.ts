import { Address } from '@graphprotocol/graph-ts';
import { Version } from '../generated/schema';
import { getVersionCounter } from './Counter';

export function getOrCreateVersion(address: Address): Version {
  let id = address.toHex();
  let version = Version.load(id);
  if (version == null) {
    version = new Version(id);
    version.counter = getVersionCounter();
    version.save();
  }

  return version;
}
