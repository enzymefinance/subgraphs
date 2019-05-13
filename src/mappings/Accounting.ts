import { EthereumBlock } from '@graphprotocol/graph-ts';
import { assetEntity } from './entities/assetEntity';
import { AssetAddition, AssetRemoval } from '../types/AccountingFactoryDataSource/templates/AccountingDataSource/AccountingContract';
import { Accounting } from '../types/schema';

export function handleAssetAddition(event: AssetAddition): void {
  let asset = assetEntity(event.params.asset).id;
  let accounting = Accounting.load(event.address.toHex()) as Accounting;
  accounting.ownedAssets.push(asset);
  accounting.save();
}

export function handleAssetRemoval(event: AssetRemoval): void {
  let accounting = Accounting.load(event.address.toHex()) as Accounting;
  let removed = event.params.asset.toHex();
  let owned = new Array<string>();
  for (let i: i32 = 0; i < accounting.ownedAssets.length; i++) {
    let current = (accounting.ownedAssets as string[])[i];
    if (removed !== current) {
      owned.push(current);
    }
  }

  accounting.ownedAssets = owned;
  accounting.save();
}

export function handleBlock(block: EthereumBlock): void {
  // TODO: https://github.com/graphprotocol/support/issues/3
}
