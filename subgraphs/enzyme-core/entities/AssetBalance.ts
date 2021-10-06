import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Asset, AssetBalance } from '../generated/schema';

export function assetBalanceId(asset: Asset, suffix: string, event: ethereum.Event): string {
  return asset.id + '/' + suffix + '/' + uniqueEventId(event);
}

export function createAssetBalance(
  asset: Asset,
  amount: BigDecimal,
  suffix: string,
  event: ethereum.Event,
): AssetBalance {
  let id = assetBalanceId(asset, suffix, event);
  let assetBalance = new AssetBalance(id);
  assetBalance.asset = asset.id;
  assetBalance.amount = amount;
  assetBalance.save();

  return assetBalance;
}
