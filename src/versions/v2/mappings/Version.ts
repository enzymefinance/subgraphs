import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { NewFund } from '../generated/v2/VersionContract/VersionContract';
import { trackFundEvent } from '../entities/Event';
import { ensureFund } from '../entities/Fund';

export function handleNewFund(event: NewFund): void {
  let fund = ensureFund(event.params.hub);
  trackFundEvent('NewFund', event, fund);
}
