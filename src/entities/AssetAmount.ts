import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Asset, AssetAmount } from '../generated/schema';
import { genericId } from '../utils/genericId';

export function assetAmountId(asset: Asset, suffix: string, event: ethereum.Event): string {
  return asset.id + '/' + suffix + '/' + genericId(event);
}

export function createAssetAmount(
  asset: Asset,
  amount: BigDecimal,
  suffix: string,
  event: ethereum.Event,
): AssetAmount {
  let id = assetAmountId(asset, suffix, event);
  let assetAmount = new AssetAmount(id);
  assetAmount.asset = asset.id;
  assetAmount.amount = amount;
  assetAmount.price = asset.price;
  assetAmount.save();

  return assetAmount;
}
