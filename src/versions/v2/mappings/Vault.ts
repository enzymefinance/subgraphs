import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import { LogSetAuthority, LogSetOwner, VaultContract } from '../generated/templates/v2/VaultContract/VaultContract';

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
