import { DataSourceContext } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureManager } from '../entities/Account';
import { useAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
import { createFund } from '../entities/Fund';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import {
  AmguPaid,
  ComptrollerLibSet,
  ComptrollerProxyDeployed,
  NewFundCreated,
} from '../generated/FundDeployerContract';
import { AmguPaidEvent, ComptrollerProxyDeployedEvent, NewFundCreatedEvent } from '../generated/schema';
import { ComptrollerLibDataSource, VaultLibDataSource } from '../generated/templates';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleNewFundCreated(event: NewFundCreated): void {
  let fundCreation = new NewFundCreatedEvent(genericId(event));
  fundCreation.timestamp = event.block.timestamp;
  fundCreation.fund = event.params.vaultProxy.toHex();
  fundCreation.account = ensureManager(event.params.fundOwner, event).id;
  fundCreation.contract = ensureContract(event.address, 'FundDeployer').id;
  fundCreation.comptrollerProxy = event.params.comptrollerProxy.toHex();
  fundCreation.vaultProxy = event.params.vaultProxy.toHex();
  fundCreation.fundOwner = ensureManager(event.params.fundOwner, event).id;
  fundCreation.fundName = event.params.fundName;
  fundCreation.creator = ensureAccount(event.params.creator, event).id;
  fundCreation.denominationAsset = useAsset(event.params.denominationAsset.toHex()).id;
  fundCreation.feeManagerConfigData = event.params.feeManagerConfigData.toHex();
  fundCreation.policyManagerConfigData = event.params.policyManagerConfigData.toHex();
  fundCreation.transaction = ensureTransaction(event).id;
  fundCreation.save();

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

export function handleComptrollerLibSet(event: ComptrollerLibSet): void {
  // TODO: implement
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
