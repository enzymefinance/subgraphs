import { Address, DataSourceContext } from '@graphprotocol/graph-ts';
import { ensureAsset } from '../../entities/Asset';
import { createCompoundDebtPosition, trackCompoundDebtPositionAssets } from '../../entities/CompoundDebtPosition';
import { ensureComptroller } from '../../entities/Comptroller';
import {
  CallOnExternalPositionExecutedForFund,
  ExternalPositionDeployedForFund,
  ExternalPositionTypeInfoUpdated,
} from '../../generated/contracts/ExternalPositionManager4Events';
import { CompoundDebtPosition } from '../../generated/schema';
import { CompoundDebtPositionLib4DataSource } from '../../generated/templates';

export function handleExternalPositionDeployedForFund(event: ExternalPositionDeployedForFund): void {
  let typeId = event.params.externalPositionTypeId.toI32();

  if (typeId == 0) {
    createCompoundDebtPosition(event.params.externalPosition, event.params.vaultProxy, typeId);

    let cdpContext = new DataSourceContext();
    cdpContext.setString('vaultProxy', event.params.vaultProxy.toHex());
    CompoundDebtPositionLib4DataSource.createWithContext(event.params.externalPosition, cdpContext);
  }
}

export function handleCallOnExternalPositionExecutedForFund(event: CallOnExternalPositionExecutedForFund): void {
  let comptrollerProxy = ensureComptroller(event.params.comptrollerProxy, event);
  let denominationAsset = ensureAsset(Address.fromString(comptrollerProxy.denomination));

  // we have to try loading entities to see which external position type we are dealing with
  let cdp = CompoundDebtPosition.load(event.params.externalPosition.toHex());
  if (cdp != null) {
    trackCompoundDebtPositionAssets(event.params.externalPosition.toHex(), denominationAsset, event);
  }
}

export function handleExternalPositionTypeInfoUpdated(event: ExternalPositionTypeInfoUpdated): void {}
