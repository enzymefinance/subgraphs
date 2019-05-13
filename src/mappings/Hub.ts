import { FundShutDown } from '../types/VersionDataSource/templates/HubDataSource/HubContract';
import { Fund } from '../types/schema';

export function handleFundShutDown(event: FundShutDown): void {
  let fund = Fund.load(event.address.toHex()) as Fund;
  fund.isShutdown = true;
  fund.save();
}
