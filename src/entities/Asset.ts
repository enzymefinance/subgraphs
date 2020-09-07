import { Address } from '@graphprotocol/graph-ts';
import { Asset } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { StandardERC20Contract } from '../generated/StandardERC20Contract';

export function useAsset(id: string): Asset {
  let asset = Asset.load(id);
  if (asset == null) {
    logCritical('Failed to load asset {}.', [id]);
  }

  return asset as Asset;
}

export function ensureAsset(address: Address): Asset {
  let asset = Asset.load(address.toHex()) as Asset;
  if (asset) {
    return asset;
  }

  let contract = StandardERC20Contract.bind(address);

  let name = contract.name();
  let symbol = contract.symbol();
  let decimals = contract.decimals();

  asset = new Asset(address.toHex());
  asset.name = name;
  asset.symbol = symbol;
  asset.decimals = decimals;
  asset.save();

  return asset;
}

export function useAssets(ids: string[]): Asset[] {
  return ids.map<Asset>((id) => useAsset(id));
}

export function ensureAssets(addresses: Address[]): Asset[] {
  let assets: Asset[] = [];
  for (let i: i32 = 0; i < addresses.length; i++) {
    assets.push(ensureAsset(addresses[i]));
  }

  return assets;
}
