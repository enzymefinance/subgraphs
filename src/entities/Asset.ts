import { Address } from '@graphprotocol/graph-ts';
import { Asset } from '../generated/schema';
import { Context } from '../context';
import { logCritical } from '../utils/logCritical';

export function useAsset(id: string): Asset {
  let asset = Asset.load(id);
  if (asset == null) {
    logCritical('Failed to load asset {}.', [id]);
  }

  return asset as Asset;
}

export function useAssets(ids: string[]): Asset[] {
  return ids.map<Asset>((id) => useAsset(id));
}

export function ensureAssets(addresses: Address[], context: Context): Asset[] {
  let assets: Asset[] = [];
  for (let i: i32 = 0; i < addresses.length; i++) {
    assets.push(ensureAsset(addresses[i], context));
  }

  return assets;
}

export function ensureAsset(address: Address, context: Context): Asset {
  let asset = Asset.load(address.toHex()) as Asset;
  if (asset) {
    return asset;
  }

  let contract = context.contracts.registry;
  if (!contract.assetIsRegistered(address)) {
    logCritical('Tried to initialize asset {} that is not currently registered.', [address.toHex()]);
  }

  let information = contract.assetInformation(address);
  let name = information.value1;
  let symbol = information.value2;
  if (address.toHex() == '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359') {
    name = 'SAI Stable Coin';
    symbol = 'SAI';
  }

  asset = new Asset(address.toHex());
  asset.name = name;
  asset.symbol = symbol;
  asset.decimals = information.value3.toI32();
  asset.save();

  return asset;
}
