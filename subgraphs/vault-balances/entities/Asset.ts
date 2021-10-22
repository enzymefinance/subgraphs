import { Address, log } from '@graphprotocol/graph-ts';
import { Asset, IgnoredAsset } from '../generated/schema';
import { tokenBalance, tokenDecimals } from '../utils/tokenCalls';

function supportBalanceOfCall(address: Address): boolean {
  let vitalik = Address.fromString('0xab5801a7d398351b8be11c439e05c5b3259aec9b');
  let balance = tokenBalance(address, vitalik);
  if (!balance) {
    log.error('cannot fetch balances for asset {}', [address.toHex()]);
    return false;
  }

  return true;
}

export function ensureAsset(address: Address): Asset | null {
  let id = address.toHex();
  let asset = Asset.load(id);

  if (asset == null) {
    let ignore = IgnoredAsset.load(id);
    if (ignore != null) {
      log.error('ignoring asset {} (blacklisted)', [id]);
      return null;
    }

    // Check if we can call .decimals() on this contract.
    if (!supportBalanceOfCall(address)) {
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
