import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import { VaultContract, LogSetAuthority, LogSetOwner } from '../generated/v2/VersionContract/VaultContract';

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let vaultContract = VaultContract.bind(event.address);
  let hubAddress = vaultContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetAuthority', event, fund);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let vaultContract = VaultContract.bind(event.address);
  let hubAddress = vaultContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetOwner', event, fund);
}
