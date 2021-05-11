import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { uniqueEventId } from '../../../utils/utils/id';
import { Asset, AssetAmount } from '../generated/schema';
import { ensureAssetPrice } from './AssetPrice';
import { ensureCurrencyPrice } from './CurrencyPrice';

export function assetAmountId(asset: Asset, suffix: string, event: ethereum.Event): string {
  return asset.id + '/' + suffix + '/' + uniqueEventId(event);
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
  assetAmount.price = ensureAssetPrice(asset, event).id;
  assetAmount.currency = ensureCurrencyPrice(event).id;
  assetAmount.save();

  return assetAmount;
}
