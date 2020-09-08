import { DataSourceContext } from '@graphprotocol/graph-ts';
import { createFund } from '../entities/Fund';
import {
  NewFundDeployed,
  AmguPaid,
  ComptrollerProxyDeployed,
  OwnershipTransferred,
} from '../generated/FundDeployerContract';
import { ComptrollerLibDataSource, VaultLibDataSource } from '../generated/templates';
import { genericId } from '../utils/genericId';
import { AmguPayment, ComptrollerProxyDeployment, FundDeployerOwnershipTransfer } from '../generated/schema';
import { toBigDecimal } from '../utils/tokenValue';
import { ensureAccount, ensureManager } from '../entities/Account';
import { ensureTransaction } from '../entities/Transaction';
import { ensureContract } from '../entities/Contract';
import { ensureComptroller } from '../entities/Comptroller';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';

export function handleNewFundDeployed(event: NewFundDeployed): void {
  createFund(event);

  let compTrollerContext = new DataSourceContext();
  compTrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());
  compTrollerContext.setString('fund', event.params.vaultProxy.toHex());

  VaultLibDataSource.create(event.params.vaultProxy);
  ComptrollerLibDataSource.createWithContext(event.params.comptrollerProxy, compTrollerContext);
}

export function handleAmguPaid(event: AmguPaid): void {
  let id = genericId(event);
  let amguPaid = new AmguPayment(id);
  amguPaid.amount = toBigDecimal(event.params.ethPaid);
  amguPaid.payer = ensureAccount(event.params.payer).id;
  amguPaid.gas = event.params.gasUsed.toI32();
  amguPaid.timestamp = event.block.timestamp;
  amguPaid.transaction = ensureTransaction(event).id;
  amguPaid.save();
}

export function handleComptrollerProxyDeployed(event: ComptrollerProxyDeployed): void {
  let comptrollerProxy = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultProxy = comptrollerProxy.getVaultProxy();

  let comptrollerProxyDeployment = new ComptrollerProxyDeployment(event.params.comptrollerProxy.toHex());
  comptrollerProxyDeployment.timestamp = event.block.timestamp;
  comptrollerProxyDeployment.fund = vaultProxy.toHex();
  comptrollerProxyDeployment.account = ensureManager(event.params.fundOwner).id;
  comptrollerProxyDeployment.contract = ensureContract(event.address, 'FundDeployer', event.block.timestamp).id;
  comptrollerProxyDeployment.comptrollerProxy = ensureComptroller(event.params.comptrollerProxy).id;
  comptrollerProxyDeployment.fundOwner = ensureManager(event.params.fundOwner).id;
  comptrollerProxyDeployment.transaction = ensureTransaction(event).id;
  comptrollerProxyDeployment.save();
}
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let id = genericId(event);

  let transfer = new FundDeployerOwnershipTransfer(id);
  transfer.timestamp = event.block.timestamp;
  transfer.contract = ensureContract(event.address, 'FundDeployer', event.block.timestamp).id;
  transfer.previousOwner = event.params.previousOwner.toHex();
  transfer.newOwner = event.params.newOwner.toHex();
  transfer.transaction = ensureTransaction(event).id;
  transfer.save();
}
