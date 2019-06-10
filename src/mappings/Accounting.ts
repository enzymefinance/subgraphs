import {
  AssetAddition,
  AssetRemoval
} from "../types/AccountingFactoryDataSource/templates/AccountingDataSource/AccountingContract";
import { Accounting, Asset } from "../types/schema";

export function handleAssetAddition(event: AssetAddition): void {
  let accounting = Accounting.load(event.address.toHex()) as Accounting;
  accounting.ownedAssets = accounting.ownedAssets.concat([
    event.params.asset.toHex()
  ]);
  accounting.save();

  let asset = Asset.load(event.params.asset.toHex()) as Asset;
  asset.fundAccountings = asset.fundAccountings.concat([event.address.toHex()]);
  asset.save();

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

  let asset = Asset.load(event.params.asset.toHex()) as Asset;
  let removedAccountings = event.address.toHex();
  let remainingAccountings = new Array<string>();
  for (let i: i32 = 0; i < asset.fundAccountings.length; i++) {
    let current = (asset.fundAccountings as string[])[i];
    if (removedAccountings !== current) {
      remainingAccountings = remainingAccountings.concat([current]);
    }
  }
  asset.fundAccountings = remainingAccountings;
  asset.save();

  // TODO: log assets over time
}
