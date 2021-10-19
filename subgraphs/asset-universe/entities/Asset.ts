import { Address } from '@graphprotocol/graph-ts';
import { Asset, Version } from '../generated/schema';
import { tokenDecimalsOrFallback, tokenName, tokenSymbol } from '../utils/tokenCalls';
import { getAssetCounter } from './Counter';

function assetId(address: Address): string {
  return address.toHex();
}

export function getOrCreateAsset(address: Address, version: Version): Asset {
  let id = assetId(address);
  let asset = Asset.load(id);

  if (asset == null) {
    asset = new Asset(id);
    asset.address = address;
    asset.decimals = tokenDecimalsOrFallback(address, 18);
    asset.symbol = tokenSymbol(address);
    asset.name = tokenName(address);
    asset.version = version.id;
    asset.counter = getAssetCounter();
    asset.registrations = new Array<string>();
    asset.save();
  }

  return asset;
}
