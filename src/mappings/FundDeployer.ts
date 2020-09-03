import { DataSourceContext } from '@graphprotocol/graph-ts';
import { ensureManager } from '../entities/Account';
import { createContractEvent } from '../entities/Event';
import { NewFundDeployed } from '../generated/FundDeployerContract';
import { Fund } from '../generated/schema';
import { ComptrollerLibDataSource, VaultLibDataSource } from '../generated/templates';
import { createFund } from '../entities/Fund';

export function handleNewFundDeployed(event: NewFundDeployed): void {
  createFund(event);

  let compTrollerContext = new DataSourceContext();
  compTrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());
  compTrollerContext.setString('fund', event.params.vaultProxy.toHex());

  VaultLibDataSource.create(event.params.vaultProxy);
  ComptrollerLibDataSource.createWithContext(event.params.comptrollerProxy, compTrollerContext);

  createContractEvent('NewFundDeployed', event);
}
