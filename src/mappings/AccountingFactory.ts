import { NewInstance } from '../types/AccountingFactoryDataSource/AccountingFactoryContract';
import { AccountingDataSource } from '../types/AccountingFactoryDataSource/templates';
import { Accounting } from '../types/schema';
import { assetEntity } from './entities/assetEntity';

export function handleNewInstance(event: NewInstance): void {
  AccountingDataSource.create(event.params.instance);

  let accounting = new Accounting(event.params.instance.toHex());
  accounting.fund = event.params.hub.toHex();
  accounting.demoniationAsset = assetEntity(event.params.denominationAsset).id;
  accounting.nativeAsset = assetEntity(event.params.nativeAsset).id;
  accounting.ownedAssets = [];
  accounting.save();
}
