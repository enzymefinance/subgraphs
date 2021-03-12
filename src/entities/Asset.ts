import { Address } from '@graphprotocol/graph-ts';
import { ERC20Contract } from '../generated/ERC20Contract';
import { Asset } from '../generated/schema';
import { getERC20Name } from '../utils/getERC20Name';
import { getERC20Symbol } from '../utils/getERC20Symbol';
import { logCritical } from '../utils/logCritical';

export function useAsset(id: string): Asset {
  let asset = Asset.load(id) as Asset;
  if (asset == null) {
    logCritical('Failed to load asset {}.', [id]);
  }

  return asset;
}

export function ensureAsset(address: Address): Asset {
  let asset = Asset.load(address.toHex()) as Asset;
  if (asset) {
    return asset;
  }

  let name = getERC20Name(address);
  let symbol = getERC20Symbol(address);

  let contract = ERC20Contract.bind(address);
  let decimalsCall = contract.try_decimals();
  if (decimalsCall.reverted) {
    logCritical('decimals() call reverted for {}', [address.toHex()]);
  }

  asset = new Asset(address.toHex());
  asset.name = name;
  asset.symbol = symbol;
  asset.decimals = decimalsCall.value;
  asset.type = 'UNKNOWN';
  asset.networkAssetHolding = '';
  asset.removed = false;
  asset.save();

  return asset;
}

export function useAssets(ids: string[]): Asset[] {
  return ids.map<Asset>((id) => useAsset(id));
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
  for (let i = 0; i < ids.length; i++) {
    let asset = Asset.load(ids[i]) as Asset;
    if (asset) {
      assets = assets.concat([asset]);
    }
  }

  return assets;
}

export function checkChai(derivative: Asset): void {
  if (derivative.symbol != 'CHAI') {
    return;
  }

  derivative.derivativeType = 'Chai';
  derivative.save();
}

export function checkSynthetix(derivative: Asset): void {
  // TODO: find better identifier of Synth assets
  if (!derivative.name.startsWith('Synth ')) {
    return;
  }

  derivative.derivativeType = 'Synthetix';
  derivative.save();
}
