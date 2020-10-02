import { DataSourceContext } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureManager } from '../entities/Account';
import { useAsset } from '../entities/Asset';
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
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleNewFundDeployed(event: NewFundDeployed): void {
  let fundDeployment = new NewFundDeployedEvent(genericId(event));
  fundDeployment.timestamp = event.block.timestamp;
  fundDeployment.fund = event.params.vaultProxy.toHex();
  fundDeployment.account = ensureManager(event.params.fundOwner, event).id;
  fundDeployment.contract = ensureContract(event.address, 'FundDeployer').id;
  fundDeployment.comptrollerProxy = event.params.comptrollerProxy.toHex();
  fundDeployment.vaultProxy = event.params.vaultProxy.toHex();
  fundDeployment.fundOwner = ensureManager(event.params.fundOwner, event).id;
  fundDeployment.fundName = event.params.fundName;
  fundDeployment.caller = ensureAccount(event.params.caller, event).id;
  fundDeployment.denominationAsset = useAsset(event.params.denominationAsset.toHex()).id;
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
  let amguPaid = new AmguPaidEvent(genericId(event));
  amguPaid.amount = toBigDecimal(event.params.ethPaid);
  amguPaid.payer = ensureAccount(event.params.payer, event).id;
  amguPaid.gas = event.params.gasUsed.toI32();
  amguPaid.timestamp = event.block.timestamp;
  amguPaid.transaction = ensureTransaction(event).id;
  amguPaid.save();
}

export function handleComptrollerProxyDeployed(event: ComptrollerProxyDeployed): void {
  // TODO: Instead of calling the contract, load the vault proxy from the fund / fund version entity.
  let comptrollerProxy = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultProxy = comptrollerProxy.getVaultProxy();

  let comptrollerProxyDeployment = new ComptrollerProxyDeployedEvent(genericId(event));
  comptrollerProxyDeployment.timestamp = event.block.timestamp;
  comptrollerProxyDeployment.fund = vaultProxy.toHex();
  comptrollerProxyDeployment.account = ensureManager(event.transaction.from, event).id;
  comptrollerProxyDeployment.contract = ensureContract(event.address, 'FundDeployer').id;
  comptrollerProxyDeployment.comptrollerProxy = event.params.comptrollerProxy.toHex();
  comptrollerProxyDeployment.transaction = ensureTransaction(event).id;
  comptrollerProxyDeployment.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let transfer = new OwnershipTransferredEvent(genericId(event));
  transfer.timestamp = event.block.timestamp;
  transfer.contract = ensureContract(event.address, 'FundDeployer').id;
  transfer.previousOwner = event.params.previousOwner.toHex();
  transfer.newOwner = event.params.newOwner.toHex();
  transfer.transaction = ensureTransaction(event).id;
  transfer.save();
}
