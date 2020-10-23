import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import { valueInterpreterAddress, wethTokenAddress } from '../addresses';
import { Asset, AssetPrice } from '../generated/schema';
import { ValueInterpreterContract } from '../generated/ValueInterpreterContract';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import { updateDailyAssetPriceCandle, updateHourlyAssetPriceCandle } from './AssetPriceCandle';

export function assetPriceId(asset: Asset, timestamp: BigInt): string {
  return asset.id + '/' + timestamp.toString();
}

export function useAssetPrice(id: string): AssetPrice {
  let price = AssetPrice.load(id) as AssetPrice;
  if (price == null) {
    logCritical('Asset price {} does not exist', [id]);
  }

  return price;
}

export function createAssetPrice(asset: Asset, current: BigDecimal, timestamp: BigInt): AssetPrice {
  let id = assetPriceId(asset, timestamp);
  let price = new AssetPrice(id);
  price.asset = asset.id;
  price.price = current;
  price.timestamp = timestamp;
  price.save();

  return price;
}

export function ensureAssetPrice(asset: Asset, current: BigDecimal, timestamp: BigInt): AssetPrice {
  let id = assetPriceId(asset, timestamp);
  let price = AssetPrice.load(id) as AssetPrice;

  if (price != null && !current.equals(price.price)) {
    price.price = current;
    price.save();
  }

  if (price == null) {
    price = createAssetPrice(asset, current, timestamp);
  }

  return price;
}

export function trackAssetPrice(asset: Asset, timestamp: BigInt, price: BigDecimal | null = null): AssetPrice {
  if (asset.type == 'USD' || price == null) {
    let valueInterpreter = ValueInterpreterContract.bind(valueInterpreterAddress);

    let valueInterpreterValues = valueInterpreter.try_calcLiveAssetValue(
      Address.fromString(asset.id),
      BigInt.fromI32(10).pow(asset.decimals as u8),
      wethTokenAddress,
    );

    if (!valueInterpreterValues.reverted) {
      price = toBigDecimal(valueInterpreterValues.value.value0);
    } else {
      log.error('No asset price for {}. This is probably fine', [asset.id]);
      price = BigDecimal.fromString('0');
    }
  }

  // TODO: correctly deal with USD priced assets
  let current = ensureAssetPrice(asset, price as BigDecimal, timestamp);
  let hourly = updateHourlyAssetPriceCandle(asset, current);
  let daily = updateDailyAssetPriceCandle(asset, current);

  // NOTE: It's important that we update the price references AFTER the candles have been updated.
  // Otherwise, we can't carry over the previous to the new candles.
  asset.price = current.id;
  asset.hourly = hourly.id;
  asset.daily = daily.id;
  asset.save();

  return current;
}

export function trackUsdQuotedAssetPrices(timestamp: BigInt): void {
  // loop through all
}
