import { DataSourceContext } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureManager } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { ensureComptroller } from '../entities/Comptroller';
import { ensureContract } from '../entities/Contract';
import { createFund } from '../entities/Fund';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import {
  AmguPaid,
  ComptrollerProxyDeployed,
  NewFundDeployed,
  OwnershipTransferred,
} from '../generated/FundDeployerContract';
import {
  AmguPaidEvent,
  ComptrollerProxyDeployedEvent,
  NewFundDeployedEvent,
  OwnershipTransferredEvent,
} from '../generated/schema';
import { ComptrollerLibDataSource, VaultLibDataSource } from '../generated/templates';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/tokenValue';

export function handleNewFundDeployed(event: NewFundDeployed): void {
  let id = event.params.vaultProxy.toHex();

  let fundDeployment = new NewFundDeployedEvent(id);
  fundDeployment.timestamp = event.block.timestamp;
  fundDeployment.fund = id;
  fundDeployment.account = ensureManager(event.params.fundOwner, event).id;
  fundDeployment.contract = ensureContract(event.address, 'FundDeployer', event).id;
  fundDeployment.comptrollerProxy = ensureComptroller(event.params.comptrollerProxy).id;
  fundDeployment.vaultProxy = event.params.vaultProxy.toHex();
  fundDeployment.fundOwner = ensureManager(event.params.fundOwner, event).id;
  fundDeployment.fundName = event.params.fundName;
  fundDeployment.caller = ensureAccount(event.params.caller, event).id;
  fundDeployment.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  fundDeployment.feeManagerConfig = event.params.feeManagerConfig.toHex();
  fundDeployment.policyManagerConfig = event.params.policyManagerConfig.toHex();
  fundDeployment.transaction = ensureTransaction(event).id;
  fundDeployment.save();

  createFund(event);

  let comptrollerContext = new DataSourceContext();
  comptrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());

  VaultLibDataSource.create(event.params.vaultProxy);
  ComptrollerLibDataSource.createWithContext(event.params.comptrollerProxy, comptrollerContext);
}

export function handleAmguPaid(event: AmguPaid): void {
  let id = genericId(event);
  let amguPaid = new AmguPaidEvent(id);
  amguPaid.amount = toBigDecimal(event.params.ethPaid);
  amguPaid.payer = ensureAccount(event.params.payer, event).id;
  amguPaid.gas = event.params.gasUsed.toI32();
  amguPaid.timestamp = event.block.timestamp;
  amguPaid.transaction = ensureTransaction(event).id;
  amguPaid.save();
}

export function handleComptrollerProxyDeployed(event: ComptrollerProxyDeployed): void {
  let comptrollerProxy = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultProxy = comptrollerProxy.getVaultProxy();

  let comptrollerProxyDeployment = new ComptrollerProxyDeployedEvent(event.params.comptrollerProxy.toHex());
  comptrollerProxyDeployment.timestamp = event.block.timestamp;
  comptrollerProxyDeployment.fund = vaultProxy.toHex();
  comptrollerProxyDeployment.account = ensureManager(event.params.fundOwner, event).id;
  comptrollerProxyDeployment.contract = ensureContract(event.address, 'FundDeployer', event).id;
  comptrollerProxyDeployment.comptrollerProxy = ensureComptroller(event.params.comptrollerProxy).id;
  comptrollerProxyDeployment.fundOwner = ensureManager(event.params.fundOwner, event).id;
  comptrollerProxyDeployment.transaction = ensureTransaction(event).id;
  comptrollerProxyDeployment.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let id = genericId(event);

  let transfer = new OwnershipTransferredEvent(id);
  transfer.timestamp = event.block.timestamp;
  transfer.contract = ensureContract(event.address, 'FundDeployer', event).id;
  transfer.previousOwner = event.params.previousOwner.toHex();
  transfer.newOwner = event.params.newOwner.toHex();
  transfer.transaction = ensureTransaction(event).id;
  transfer.save();
}
