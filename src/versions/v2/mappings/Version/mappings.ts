import {
  AmguPaid,
  LogSetAuthority,
  LogSetOwner,
  NewFund,
  VersionContract,
} from '../../generated/v2/VersionContract/VersionContract';
import { RegistryContract } from '../../generated/v2/VersionContract/RegistryContract';
import { createEvent } from '../../utils/event';
import { Address, DataSourceTemplate, DataSourceContext } from '@graphprotocol/graph-ts';
import { Version } from '../../generated/schema';

function ensureVersion(address: Address): Version {
  let version = Version.load(address.toHex()) as Version;
  if (version) {
    return version;
  }

  let versionContract = VersionContract.bind(address);

  let registryAddress = versionContract.registry();
  let registryContract = RegistryContract.bind(registryAddress);
  let registryContext = new DataSourceContext();
  registryContext.setString('version', address.toHex());

  // Start observing the registry on behalf of this version.
  DataSourceTemplate.createWithContext('v2/RegistryContract', [registryAddress.toHex()], registryContext);

  version = new Version(address.toHex());
  let engineAddress = versionContract.engine();

  version.registryAddress = registryAddress.toHex();
  version.engineAddress = engineAddress.toHex();

  version.save();

  return version;
}

export function handleAmguPaid(event: AmguPaid): void {
  let version = ensureVersion(event.address);
  let entity = createEvent('AmguPaid', event, event.address);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let version = ensureVersion(event.address);
  let entity = createEvent('LogSetAuthority', event, event.address);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let version = ensureVersion(event.address);
  let entity = createEvent('LogSetOwner', event, event.address);
}

export function handleNewFund(event: NewFund): void {
  let version = ensureVersion(event.address);
  let entity = createEvent('NewFund', event, event.address);
}
