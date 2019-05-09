import { Fund } from '../types/schema'
import { FundShutDown } from '../types/Version/templates/Hub/Hub';

export function handleFundShutDown(event: FundShutDown): void {
  let fund = Fund.load(event.address.toHexString());
  if (!fund) {
    return;
  }

  fund.isShutdown = true;
  fund.save();
}
