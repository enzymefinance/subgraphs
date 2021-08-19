import { DataSourceContext } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureOwner } from '../../entities/Account';
import { ensureAsset } from '../../entities/Asset';
import { ensureComptroller } from '../../entities/Comptroller';
import { trackNetworkFunds } from '../../entities/Network';
import { ensureRelease } from '../../entities/Release';
import { createVault } from '../../entities/Vault';
import {
  ComptrollerLibSet,
  ComptrollerProxyDeployed,
  NewFundCreated,
  ReleaseStatusSet,
  VaultCallDeregistered,
  VaultCallRegistered,
} from '../../generated/FundDeployer3Contract';
import { ComptrollerLib3DataSource, VaultLib3DataSource } from '../../generated/templates';

export function handleNewFundCreated(event: NewFundCreated): void {
  let vault = createVault(
    event.params.vaultProxy,
    event.params.fundName,
    event.block.timestamp,
    ensureRelease(event.address, event),
    ensureComptroller(event.params.comptrollerProxy, event),
    ensureOwner(event.params.fundOwner, event),
    ensureAccount(event.params.creator, event),
  );

  trackNetworkFunds(event);

  let comptrollerContext = new DataSourceContext();
  comptrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());

  VaultLib3DataSource.create(event.params.vaultProxy);
  ComptrollerLib3DataSource.createWithContext(event.params.comptrollerProxy, comptrollerContext);

  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  comptroller.vault = vault.id;
  comptroller.activation = event.block.timestamp.toI32();
  comptroller.status = 'COMMITTED';
  comptroller.save();
}

export function handleComptrollerProxyDeployed(event: ComptrollerProxyDeployed): void {
  // datasource for new comptroller is created either in the NewFundCreated event (for new funds)
  // or in the MigrationExecuted event (for migrations)

  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  comptroller.creator = ensureAccount(event.params.creator, event).id;
  comptroller.creation = event.block.timestamp.toI32();
  comptroller.denomination = ensureAsset(event.params.denominationAsset).id;
  comptroller.release = ensureRelease(event.address, event).id;
  comptroller.status = 'FREE';
  comptroller.save();
}

export function handleReleaseStatusSet(event: ReleaseStatusSet): void {
  let release = ensureRelease(event.address, event);
  release.isLive = event.params.nextStatus == 1 ? true : false;
  release.save();
}

export function handleComptrollerLibSet(event: ComptrollerLibSet): void {}
export function handleVaultCallDeregistered(event: VaultCallDeregistered): void {}
export function handleVaultCallRegistered(event: VaultCallRegistered): void {}
