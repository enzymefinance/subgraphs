import { tokenDecimalsOrThrow, tokenName, tokenSymbol } from '../utils/tokenCalls';
import { Address } from '@graphprotocol/graph-ts';
import { Asset } from '../generated/schema';

export function ensureAsset(address: Address): Asset {
  let asset = Asset.load(address.toHex());
  if (asset) {
    return asset;
  }

  let name = tokenName(address);
  let symbol = tokenSymbol(address);
  let decimals = tokenDecimalsOrThrow(address);

  asset = new Asset(address.toHex());
  asset.name = name;
  asset.symbol = symbol;
  asset.decimals = decimals;
  asset.save();

  return asset;
}

export function ensureAssets(addresses: Address[]): Asset[] {
  let assets: Asset[] = new Array<Asset>();
  for (let i: i32 = 0; i < addresses.length; i++) {
    assets = assets.concat([ensureAsset(addresses[i])]);
  }

  return assets;
}

export function extractAssets(ids: string[]): Asset[] {
  let assets: Asset[] = new Array<Asset>();
  for (let i: i32 = 0; i < ids.length; i++) {
    let asset = Asset.load(ids[i]);
    if (asset) {
      assets = assets.concat([asset]);
    }
  }

  return assets;
}
