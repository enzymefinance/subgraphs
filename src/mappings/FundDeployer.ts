import { NewFundDeployed } from '../generated/FundDeployerContract';
import { Fund } from '../generated/schema';
import {
  VaultLibDataSource,
  ComptrollerLibDataSource,
} from '../generated/templates';

export function handleNewFundDeployed(event: NewFundDeployed): void {
  let fund = new Fund(event.params.vaultProxy.toHex());
  fund.name = event.params.fundName;
  fund.save();

  VaultLibDataSource.create(event.params.vaultProxy);
  ComptrollerLibDataSource.create(event.params.comptrollerProxy);
}
