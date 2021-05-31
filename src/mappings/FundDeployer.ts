import { DataSourceContext } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureManager } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { createFund } from '../entities/Fund';
import { ensureNetwork } from '../entities/Network';
import { ensureRelease } from '../entities/Release';
import { ensureTransaction } from '../entities/Transaction';
import {
  ComptrollerLibSet,
  ComptrollerProxyDeployed,
  NewFundCreated,
  ReleaseStatusSet,
  VaultCallDeregistered,
  VaultCallRegistered,
} from '../generated/FundDeployerContract';
import {
  ComptrollerLibSetEvent,
  ComptrollerProxyDeployedEvent,
  NewFundCreatedEvent,
  ReleaseStatusSetEvent,
  VaultCallDeregisteredEvent,
  VaultCallRegisteredEvent,
} from '../generated/schema';
import { ComptrollerLibDataSource, VaultLibDataSource } from '../generated/templates';
import { genericId } from '../utils/genericId';

export function handleNewFundCreated(event: NewFundCreated): void {
  let manager = ensureManager(event.params.fundOwner, event);

  let fundCreation = new NewFundCreatedEvent(genericId(event));
  fundCreation.timestamp = event.block.timestamp;
  fundCreation.fund = event.params.vaultProxy.toHex();
  fundCreation.comptroller = event.params.comptrollerProxy.toHex();
  fundCreation.vaultProxy = event.params.vaultProxy.toHex();
  fundCreation.fundOwner = manager.id;
  fundCreation.fundName = event.params.fundName;
  fundCreation.creator = ensureAccount(event.params.creator, event).id;
  fundCreation.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  fundCreation.sharesActionTimelock = event.params.sharesActionTimelock;
  fundCreation.feeManagerConfigData = event.params.feeManagerConfigData.toHex();
  fundCreation.policyManagerConfigData = event.params.policyManagerConfigData.toHex();
  fundCreation.transaction = ensureTransaction(event).id;
  fundCreation.save();

  let fund = createFund(event);

  let comptrollerContext = new DataSourceContext();
  comptrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());

  VaultLibDataSource.create(event.params.vaultProxy);
  ComptrollerLibDataSource.createWithContext(event.params.comptrollerProxy, comptrollerContext);

  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  comptrollerProxy.fund = fund.id;
  comptrollerProxy.activationTime = event.block.timestamp;
  comptrollerProxy.status = 'COMMITTED';
  comptrollerProxy.save();
}

export function handleComptrollerLibSet(event: ComptrollerLibSet): void {
  let comptrollerLib = new ComptrollerLibSetEvent(genericId(event));
  comptrollerLib.timestamp = event.block.timestamp;
  comptrollerLib.comptrollerLib = event.params.comptrollerLib.toHex();
  comptrollerLib.transaction = ensureTransaction(event).id;
  comptrollerLib.save();
}

export function handleComptrollerProxyDeployed(event: ComptrollerProxyDeployed): void {
  let comptrollerProxyDeployment = new ComptrollerProxyDeployedEvent(genericId(event));
  comptrollerProxyDeployment.timestamp = event.block.timestamp;
  comptrollerProxyDeployment.creator = ensureManager(event.params.creator, event).id;
  comptrollerProxyDeployment.comptrollerProxy = event.params.comptrollerProxy.toHex();
  comptrollerProxyDeployment.transaction = ensureTransaction(event).id;
  comptrollerProxyDeployment.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  comptrollerProxyDeployment.sharesActionTimelock = event.params.sharesActionTimelock;
  comptrollerProxyDeployment.feeManagerConfigData = event.params.feeManagerConfigData.toHexString();
  comptrollerProxyDeployment.policyManagerConfigData = event.params.policyManagerConfigData.toHexString();
  comptrollerProxyDeployment.forMigration = event.params.forMigration;
  comptrollerProxyDeployment.save();

  // datasource for new comptroller is created either in the NewFundCreated event (for new funds)
  // or in the MigrationExecuted event (for migrations)

  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  comptrollerProxy.creator = ensureManager(event.params.creator, event).id;
  comptrollerProxy.timestamp = event.block.timestamp;
  comptrollerProxy.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  comptrollerProxy.sharesActionTimelock = event.params.sharesActionTimelock;
  comptrollerProxy.feeManagerConfigData = event.params.feeManagerConfigData.toHexString();
  comptrollerProxy.policyManagerConfigData = event.params.policyManagerConfigData.toHexString();
  comptrollerProxy.release = ensureRelease(event.address.toHex(), event).id;
  comptrollerProxy.status = 'FREE';
  comptrollerProxy.save();
}

export function handleReleaseStatusSet(event: ReleaseStatusSet): void {
  let statusSet = new ReleaseStatusSetEvent(genericId(event));
  statusSet.timestamp = event.block.timestamp;
  statusSet.transaction = ensureTransaction(event).id;
  statusSet.prevStatus = event.params.prevStatus;
  statusSet.nextStatus = event.params.nextStatus;
  statusSet.save();
}

export function handleVaultCallDeregistered(event: VaultCallDeregistered): void {
  let deregistered = new VaultCallDeregisteredEvent(genericId(event));
  deregistered.timestamp = event.block.timestamp;
  deregistered.transaction = ensureTransaction(event).id;
  deregistered.contractAddress = event.params.contractAddress.toHex();
  deregistered.selector = event.params.selector.toHexString();
  deregistered.save();
}

export function handleVaultCallRegistered(event: VaultCallRegistered): void {
  // NOTE: This is the first event on testnet.
  ensureNetwork(event);

  let registered = new VaultCallRegisteredEvent(genericId(event));
  registered.timestamp = event.block.timestamp;
  registered.transaction = ensureTransaction(event).id;
  registered.contractAddress = event.params.contractAddress.toHex();
  registered.selector = event.params.selector.toHexString();
  registered.save();
}
