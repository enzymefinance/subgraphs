import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../../utils/entities/fund';
import { trackFundEvent } from '../../utils/entities/event';
import { LogSetAuthority, LogSetOwner, VaultContract } from '../../generated/templates/v2/VaultContract/VaultContract';

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let participationContract = VaultContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('LogSetAuthority', event, hubAddress);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let participationContract = VaultContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('LogSetOwner', event, hubAddress);
  let fund = ensureFund(hubAddress);
}
