import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Asset, AssetAmount } from '../generated/schema';
import { ensureAssetPrice } from './AssetPrice';
import { ensureCurrencyPrice } from './CurrencyPrice';

export function assetAmountId(asset: Asset, suffix: string, event: ethereum.Event): string {
  return asset.id + '/' + suffix + '/' + uniqueEventId(event);
}

export function createAssetAmount(
  asset: Asset,
  amount: BigDecimal,
  denominationAsset: Asset,
  suffix: string,
  event: ethereum.Event,
): AssetAmount {
  let assetPrice = ensureAssetPrice(asset, event);
  let denominationAssetPrice = ensureAssetPrice(denominationAsset, event);

  let assetValueEth = amount.times(assetPrice.price);
  let assetValueDenomination = assetValueEth.div(denominationAssetPrice.price);

  let currencyPrice = ensureCurrencyPrice(event);

  let id = assetAmountId(asset, suffix, event);
  let assetAmount = new AssetAmount(id);
  assetAmount.asset = asset.id;
  assetAmount.amount = amount;
  assetAmount.denominationAsset = denominationAsset.id;
  assetAmount.valueDenomination = assetValueDenomination;
  assetAmount.valueAud = assetValueEth.times(currencyPrice.ethAud);
  assetAmount.valueBtc = assetValueEth.times(currencyPrice.ethBtc);
  assetAmount.valueChf = assetValueEth.times(currencyPrice.ethChf);
  assetAmount.valueEth = assetValueEth;
  assetAmount.valueEur = assetValueEth.times(currencyPrice.ethEur);
  assetAmount.valueGbp = assetValueEth.times(currencyPrice.ethGbp);
  assetAmount.valueJpy = assetValueEth.times(currencyPrice.ethJpy);
  assetAmount.valueUsd = assetValueEth.times(currencyPrice.ethUsd);
  assetAmount.timestamp = event.block.timestamp.toI32();
  assetAmount.save();

  return assetAmount;
}
