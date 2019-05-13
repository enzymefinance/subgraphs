import { EthereumBlock } from '@graphprotocol/graph-ts';
import { AssetAddition } from '../types/VersionDataSource/AccountingContract';
import { AssetRemoval } from '../types/VersionDataSource/templates/AccountingDataSource/AccountingContract';
import { accountingEntity } from './entities/accountingEntity';
import { assetEntity } from './entities/assetEntity';

export function handleAssetAddition(event: AssetAddition): void {
  let accounting = accountingEntity(event.address);
  accounting.ownedAssets.push(assetEntity(event.params.asset).id);
  accounting.save();
}

export function handleAssetRemoval(event: AssetRemoval): void {
  let accounting = accountingEntity(event.address);
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
