import { logCritical, tokenName, tokenSymbol } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import { ERC20Contract } from '../generated/ERC20Contract';
import { Asset } from '../generated/schema';

export function ensureAsset(address: Address): Asset {
  let asset = Asset.load(address.toHex()) as Asset;
  if (asset) {
    return asset;
  }

  let name = tokenName(address);
  let symbol = tokenSymbol(address);

  let contract = ERC20Contract.bind(address);
  let decimalsCall = contract.try_decimals();
  if (decimalsCall.reverted) {
    logCritical('decimals() call reverted for {}', [address.toHex()]);
  }

  asset = new Asset(address.toHex());
  asset.name = name;
  asset.symbol = symbol;
  asset.decimals = decimalsCall.value;
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
  for (let i = 0; i < ids.length; i++) {
    let asset = Asset.load(ids[i]) as Asset;
    if (asset) {
      assets = assets.concat([asset]);
    }
  }

  return assets;
}
