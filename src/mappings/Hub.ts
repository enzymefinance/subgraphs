import { FundShutDown } from '../types/VersionDataSource/HubContract';
import { fundEntity } from './entities/fundEntity';

export function handleFundShutDown(event: FundShutDown): void {
  let fund = fundEntity(event.address);
  fund.isShutdown = true;
  fund.save();
}
