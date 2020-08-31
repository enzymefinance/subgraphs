import { NewFundDeployed } from '../generated/FundDeployerContract';
import { Fund } from '../generated/schema';

export function handleNewFundDeployed(event: NewFundDeployed): void {
  let fund = new Fund(event.params.vaultProxy.toHex());
  fund.name = event.params.fundName;
  fund.save();
}
