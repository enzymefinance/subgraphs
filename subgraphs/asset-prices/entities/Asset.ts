import { Address } from '@graphprotocol/graph-ts';
import { tokenDecimals, tokenName, tokenSymbol } from '@enzymefinance/subgraph-utils';
import { Asset } from '../generated/schema';

export function getOrCreateAsset(address: Address): Asset {
  let id = address.toHex();
  let asset = Asset.load(id) as Asset;

  if (asset == null) {
    let decimals = tokenDecimals(address);

    asset = new Asset(id);
    asset.price = '';
    asset.name = tokenName(address);
    asset.symbol = tokenSymbol(address);
    asset.decimals = decimals == -1 ? 18 : decimals;
    asset.registrations = [];
    asset.save();
  }

  return asset;
}
