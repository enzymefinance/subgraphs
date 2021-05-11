import { Address, log } from '@graphprotocol/graph-ts';
import { tokenBalance, tokenDecimals, tokenName, tokenSymbol } from '@enzymefinance/subgraph-utils';
import { Asset } from '../generated/schema';

export function ensureAsset(address: Address): Asset | null {
  let id = address.toHex();
  let asset = Asset.load(id) as Asset;

  if (asset == null) {
    // Check if we can call .decimals() on this contract.
    let decimals = tokenDecimals(address);
    if (decimals == -1) {
      log.error('ignoring asset {} (cannot fetch decimals)', [id]);
      return null;
    }

    // Check if we can call .balanceOf() on this contract.
    let vitalik = Address.fromString('0xab5801a7d398351b8be11c439e05c5b3259aec9b');
    let balance = tokenBalance(address, vitalik);
    if (balance == null) {
      log.error('ignoring asset {} (cannot fetch balances)', [id]);
      return null;
    }

    let name = tokenName(address);
    let symbol = tokenSymbol(address);

    asset = new Asset(id);
    asset.name = name;
    asset.symbol = symbol;
    asset.decimals = decimals;
    asset.save();
  }

  return asset;
}