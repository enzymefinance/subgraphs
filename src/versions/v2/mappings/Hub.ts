import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund, updateFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import { FundShutDown } from '../generated/v2/VersionContract/HubContract';

export function handleFundShutDown(event: FundShutDown): void {
  let fund = updateFund(ensureFund(event.address));
  trackFundEvent('FundShutDown', event, fund);
}
