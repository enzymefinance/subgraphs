import { NewInstance } from '../types/AccountingFactoryDataSource/AccountingFactoryContract';
import { AccountingDataSource } from '../types/AccountingFactoryDataSource/templates';
import { Accounting } from '../types/schema';

export function handleNewInstance(event: NewInstance): void {
  AccountingDataSource.create(event.params.instance);

  let accounting = new Accounting(event.params.instance.toHex());
  accounting.fund = event.params.hub.toHex();
  accounting.demoniationAsset = event.params.denominationAsset.toHex();
  accounting.nativeAsset = event.params.nativeAsset.toHex();
  accounting.ownedAssets = [];
  accounting.save();
}
