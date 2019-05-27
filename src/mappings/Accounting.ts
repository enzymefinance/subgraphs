import {
  AssetAddition,
  AssetRemoval
} from "../types/AccountingFactoryDataSource/templates/AccountingDataSource/AccountingContract";
import { Accounting } from "../types/schema";

export function handleAssetAddition(event: AssetAddition): void {
  let accounting = Accounting.load(event.address.toHex()) as Accounting;
  accounting.ownedAssets = accounting.ownedAssets.concat([
    event.params.asset.toHex()
  ]);
  accounting.save();

  // TODO: log assets over time
}

export function handleAssetRemoval(event: AssetRemoval): void {
  let accounting = Accounting.load(event.address.toHex()) as Accounting;
  let removed = event.params.asset.toHex();
  let owned = new Array<string>();
  for (let i: i32 = 0; i < accounting.ownedAssets.length; i++) {
    let current = (accounting.ownedAssets as string[])[i];
    if (removed !== current) {
      owned = owned.concat([current]);
    }
  }

  accounting.ownedAssets = owned;
  accounting.save();

  // TODO: log assets over time
}
