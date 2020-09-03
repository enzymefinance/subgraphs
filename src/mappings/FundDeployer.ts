import { DataSourceContext } from '@graphprotocol/graph-ts';
import { createContractEvent } from '../entities/Event';
import { createFund } from '../entities/Fund';
import { NewFundDeployed } from '../generated/FundDeployerContract';
import { ComptrollerLibDataSource, VaultLibDataSource } from '../generated/templates';

export function handleNewFundDeployed(event: NewFundDeployed): void {
  createFund(event);

  let compTrollerContext = new DataSourceContext();
  compTrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());
  compTrollerContext.setString('fund', event.params.vaultProxy.toHex());

  VaultLibDataSource.create(event.params.vaultProxy);
  ComptrollerLibDataSource.createWithContext(event.params.comptrollerProxy, compTrollerContext);

  createContractEvent('NewFundDeployed', event);
}
