import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, DataSourceContext } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureOwner } from '../../entities/Account';
import { ensureAsset } from '../../entities/Asset';
import { ensureComptroller } from '../../entities/Comptroller';
import { getActivityCounter } from '../../entities/Counter';
import { trackNetworkFunds } from '../../entities/Network';
import { useProtocolFee } from '../../entities/ProtocolFee';
import { generateReconfigurationId, useReconfiguraton } from '../../entities/Reconfiguration';
import { ensureRelease } from '../../entities/Release';
import { createVault, useVault } from '../../entities/Vault';
import {
  BuySharesOnBehalfCallerDeregistered,
  BuySharesOnBehalfCallerRegistered,
  ComptrollerLibSet,
  ComptrollerProxyDeployed,
  MigrationRequestCreated,
  NewFundCreated,
  ProtocolFeeTrackerSet,
  ReconfigurationRequestCancelled,
  ReconfigurationRequestCreated,
  ReconfigurationRequestExecuted,
  ReconfigurationTimelockSet,
  ReleaseIsLive,
  VaultCallDeregistered,
  VaultCallRegistered,
  VaultLibSet,
} from '../../generated/contracts/FundDeployer4Events';
import { ProtocolSdk } from '../../generated/contracts/ProtocolSdk';
import {
  Reconfiguration,
  VaultReconfigurationCancelled,
  VaultReconfigurationExecuted,
  VaultReconfigurationSignalled,
} from '../../generated/schema';
import { ComptrollerLib4DataSource, VaultLib4DataSource } from '../../generated/templates';

export function handleNewFundCreated(event: NewFundCreated): void {
  let vaultContract = ProtocolSdk.bind(event.params.vaultProxy);
  let fundName = vaultContract.name();
  let owner = vaultContract.getOwner();
  let protocolFee = vaultContract.getProtocolFeeTracker();

  let vault = createVault(
    event.params.vaultProxy,
    fundName,
    event.block.timestamp,
    ensureRelease(event.address, event),
    ensureComptroller(event.params.comptrollerProxy, event),
    ensureOwner(owner, event),
    ensureAccount(event.params.creator, event),
  );

  vault.protocolFee = useProtocolFee(event.params.vaultProxy, protocolFee).id;
  vault.save();

  trackNetworkFunds(event);

  let comptrollerContext = new DataSourceContext();
  comptrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());

  VaultLib4DataSource.create(event.params.vaultProxy);
  ComptrollerLib4DataSource.createWithContext(event.params.comptrollerProxy, comptrollerContext);

  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  comptroller.vault = vault.id;
  comptroller.activation = event.block.timestamp.toI32();
  comptroller.status = 'COMMITTED';
  comptroller.save();
}

export function handleComptrollerProxyDeployed(event: ComptrollerProxyDeployed): void {
  // datasource for new comptroller is created either in the NewFundCreated event (for new funds)
  // or in the MigrationExecuted event (for migrations) or in the ReconfigurationRequestExecuted (for reconfigurations)

  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  comptroller.creator = ensureAccount(event.params.creator, event).id;
  comptroller.creation = event.block.timestamp.toI32();
  comptroller.denomination = ensureAsset(event.params.denominationAsset).id;
  comptroller.release = ensureRelease(event.address, event).id;
  comptroller.status = 'FREE';
  comptroller.sharesActionTimelock = event.params.sharesActionTimelock.toI32();
  comptroller.save();
}

export function handleReleaseIsLive(event: ReleaseIsLive): void {
  let release = ensureRelease(event.address, event);
  release.isLive = true;
  release.save();
}

export function handleMigrationRequestCreated(event: MigrationRequestCreated): void {
  // TODO: do we need to handle this? It's just a wrapper around for creating a comptroller and signalling migration
}

export function handleReconfigurationRequestCancelled(event: ReconfigurationRequestCancelled): void {
  let reconfigurationId = generateReconfigurationId(
    event.params.vaultProxy,
    event.address,
    event.params.nextComptrollerProxy,
  );

  let reconfiguration = useReconfiguraton(reconfigurationId);
  reconfiguration.cancelled = true;
  reconfiguration.cancelledTimestamp = event.block.timestamp.toI32();
  reconfiguration.save();

  let comptrollerProxy = ensureComptroller(Address.fromString(reconfiguration.comptroller), event);
  comptrollerProxy.vault = null;
  comptrollerProxy.status = 'DESTRUCTED';
  comptrollerProxy.save();

  let activity = new VaultReconfigurationCancelled(uniqueEventId(event, 'ReconfigurationCancelled'));
  activity.timestamp = event.block.timestamp.toI32();
  activity.vault = event.params.vaultProxy.toHex();
  activity.reconfiguration = reconfigurationId;
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Vault'];
  activity.activityType = 'VaultSettings';
  activity.save();
}

export function handleReconfigurationRequestCreated(event: ReconfigurationRequestCreated): void {
  let reconfigurationId = generateReconfigurationId(
    event.params.vaultProxy,
    event.address,
    event.params.comptrollerProxy,
  );

  let reconfiguration = new Reconfiguration(reconfigurationId);
  reconfiguration.vault = useVault(event.params.vaultProxy.toHex()).id;
  reconfiguration.comptroller = ensureComptroller(event.params.comptrollerProxy, event).id;
  reconfiguration.release = ensureRelease(event.address, event).id;
  reconfiguration.executableTimestamp = event.params.executableTimestamp.toI32();
  reconfiguration.cancelled = false;
  reconfiguration.executed = false;
  reconfiguration.save();

  let vault = useVault(event.params.vaultProxy.toHex());

  let comptrollerProxy = ensureComptroller(event.params.comptrollerProxy, event);
  comptrollerProxy.vault = vault.id;
  comptrollerProxy.status = 'SIGNALLED';
  comptrollerProxy.save();

  let activity = new VaultReconfigurationSignalled(uniqueEventId(event, 'ReconfigurationSignalled'));
  activity.timestamp = event.block.timestamp.toI32();
  activity.vault = event.params.vaultProxy.toHex();
  activity.reconfiguration = reconfigurationId;
  activity.nextComptroller = comptrollerProxy.id;
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Vault'];
  activity.activityType = 'VaultSettings';
  activity.save();
}

export function handleReconfigurationRequestExecuted(event: ReconfigurationRequestExecuted): void {
  let reconfigurationId = generateReconfigurationId(
    event.params.vaultProxy,
    event.address,
    event.params.nextComptrollerProxy,
  );

  let reconfiguration = useReconfiguraton(reconfigurationId);
  reconfiguration.executed = true;
  reconfiguration.executedTimestamp = event.block.timestamp.toI32();
  reconfiguration.save();

  let vault = useVault(event.params.vaultProxy.toHex());
  vault.comptroller = ensureComptroller(event.params.nextComptrollerProxy, event).id;
  vault.save();

  // start monitoring the Comptroller Proxy
  let comptrollerContext = new DataSourceContext();
  comptrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());
  ComptrollerLib4DataSource.createWithContext(event.params.nextComptrollerProxy, comptrollerContext);

  let comptrollerProxy = ensureComptroller(event.params.nextComptrollerProxy, event);
  comptrollerProxy.activation = event.block.timestamp.toI32();
  comptrollerProxy.status = 'COMMITTED';
  comptrollerProxy.save();

  let prevComptrollerProxy = ensureComptroller(event.params.prevComptrollerProxy, event);
  prevComptrollerProxy.destruction = event.block.timestamp.toI32();
  prevComptrollerProxy.status = 'DESTRUCTED';
  prevComptrollerProxy.save();

  let activity = new VaultReconfigurationExecuted(uniqueEventId(event, 'ReconfigurationExexcuted'));
  activity.timestamp = event.block.timestamp.toI32();
  activity.vault = event.params.vaultProxy.toHex();
  activity.reconfiguration = reconfigurationId;
  activity.nextComptroller = comptrollerProxy.id;
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Vault'];
  activity.activityType = 'VaultSettings';
  activity.save();
}

export function handleBuySharesOnBehalfCallerDeregistered(event: BuySharesOnBehalfCallerDeregistered): void {}
export function handleBuySharesOnBehalfCallerRegistered(event: BuySharesOnBehalfCallerRegistered): void {}
export function handleComptrollerLibSet(event: ComptrollerLibSet): void {}
export function handleProtocolFeeTrackerSet(event: ProtocolFeeTrackerSet): void {}
export function handleReconfigurationTimelockSet(event: ReconfigurationTimelockSet): void {}
export function handleVaultCallDeregistered(event: VaultCallDeregistered): void {}
export function handleVaultCallRegistered(event: VaultCallRegistered): void {}
export function handleVaultLibSet(event: VaultLibSet): void {}
