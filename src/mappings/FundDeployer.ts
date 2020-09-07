import { DataSourceContext } from '@graphprotocol/graph-ts';
import { createContractEvent } from '../entities/ContractEvent';
import { createFund } from '../entities/Fund';
import {
  NewFundDeployed,
  AmguPaid,
  ComptrollerProxyDeployed,
  OwnershipTransferred,
} from '../generated/FundDeployerContract';
import { ComptrollerLibDataSource, VaultLibDataSource } from '../generated/templates';
import { genericId } from '../utils/genericId';
import { AmguPayment } from '../generated/schema';
import { toBigDecimal } from '../utils/tokenValue';
import { ensureAccount } from '../entities/Account';

export function handleNewFundDeployed(event: NewFundDeployed): void {
  createFund(event);

  let compTrollerContext = new DataSourceContext();
  compTrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());
  compTrollerContext.setString('fund', event.params.vaultProxy.toHex());

  VaultLibDataSource.create(event.params.vaultProxy);
  ComptrollerLibDataSource.createWithContext(event.params.comptrollerProxy, compTrollerContext);

  createContractEvent('NewFundDeployed', event);
}

export function handleAmguPaid(event: AmguPaid): void {
  let id = genericId(event);
  let amguPaid = new AmguPayment(id);
  amguPaid.amount = toBigDecimal(event.params.ethPaid);
  amguPaid.payer = ensureAccount(event.params.payer).id;
  amguPaid.gas = event.params.gasUsed.toI32();
  amguPaid.save();

  createContractEvent('AmguPaid', event);
}
export function handleComptrollerProxyDeployed(event: ComptrollerProxyDeployed): void {}
export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
