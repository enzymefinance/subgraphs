import { Address } from '@graphprotocol/graph-ts';
import { ERC20Contract } from '../generated/ERC20Contract';
import { Asset } from '../generated/schema';
import { getMainnetTokenAddress } from '../utils/getMainnetTokenAddress';
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

  let contract = ERC20Contract.bind(address);
  let name = !contract.try_name().reverted ? contract.try_name().value : '';
  let symbol = !contract.try_symbol().reverted ? contract.try_symbol().value : '';
  let decimals = !contract.try_decimals().reverted ? contract.try_decimals().value : 18;

  asset = new Asset(address.toHex());
  asset.ref = getMainnetTokenAddress(symbol);
  asset.name = name;
  asset.symbol = symbol;
  asset.decimals = decimals;
  asset.type = '';
  asset.networkAssetHolding = '';
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
  if (!(derivative.symbol.startsWith('s') || derivative.symbol.startsWith('i'))) {
    return;
  }

  derivative.derivativeType = 'Synthetix';
  derivative.save();
}
