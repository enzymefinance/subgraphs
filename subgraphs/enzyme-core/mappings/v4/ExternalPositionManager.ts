import { DataSourceContext } from '@graphprotocol/graph-ts';
import { createCompoundDebtPosition, trackCompoundDebtPositionAssets } from '../../entities/CompoundDebtPosition';
import {
  CallOnExternalPositionExecutedForFund,
  ExternalPositionDeployedForFund,
  ExternalPositionTypeInfoUpdated,
} from '../../generated/ExternalPositionManager4Contract';
import { CompoundDebtPosition } from '../../generated/schema';
import { CompoundDebtPositionLib4DataSource } from '../../generated/templates';

export function handleExternalPositionDeployedForFund(event: ExternalPositionDeployedForFund): void {
  let typeId = event.params.externalPositionTypeId.toI32();

  if (typeId == 0) {
    createCompoundDebtPosition(event.params.externalPosition, event.params.vaultProxy, typeId);

    let cdpContext = new DataSourceContext();
    cdpContext.setString('vaultProxy', event.params.vaultProxy.toHex());
    CompoundDebtPositionLib4DataSource.createWithContext(event.params.comptrollerProxy, cdpContext);
  }
}

export function handleCallOnExternalPositionExecutedForFund(event: CallOnExternalPositionExecutedForFund): void {
  // we have to try loading entities to see which external position type we are dealing with
  let cdp = CompoundDebtPosition.load(event.params.externalPosition.toHex());
  if (cdp != null) {
    trackCompoundDebtPositionAssets(event.params.externalPosition.toHex(), event);
  }
}

export function handleExternalPositionTypeInfoUpdated(event: ExternalPositionTypeInfoUpdated): void {}