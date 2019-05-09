import { Fund } from '../types/schema'
import { FundShutDown } from '../types/Version/templates/Hub/Hub';

export function handleFundShutDown(event: FundShutDown): void {
  let fund = Fund.load(event.address.toHexString());
  fund.shutdown = true;
  fund.save();
}
