import { Address, log } from '@graphprotocol/graph-ts';
import { Asset, IgnoredAsset } from '../generated/schema';
import { supportsBalanceOfCall, tokenDecimals } from '../utils/tokenCalls';

export function getOrCreateAsset(address: Address): Asset | null {
  let id = address.toHex();
  let asset = Asset.load(id);

  if (asset == null) {
    let ignore = IgnoredAsset.load(id);
    if (ignore != null) {
      log.error('ignoring asset {} (blacklisted)', [id]);
      return null;
    }

    // Check if we can call .balanceOf() on this contract.
    if (!supportsBalanceOfCall(address)) {
      log.error('ignoring asset {} (unsupported)', [id]);
      let ignore = new IgnoredAsset(id);
      ignore.save();
    }

    asset = new Asset(id);
    asset.decimals = tokenDecimals(address, 18);
    asset.save();
  }

  return asset;
}
