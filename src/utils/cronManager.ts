import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { wethTokenAddress } from '../addresses';
import { useAsset } from '../entities/Asset';
import { fetchAssetPrice, trackAssetPrice, useAssetPrice } from '../entities/AssetPrice';
import {
  ensureDailyPriceCandleGroup,
  ensureHourlyPriceCandleGroup,
  ensureMonthlyPriceCandleGroup,
} from '../entities/PriceCandleGroup';
import { Cron } from '../generated/schema';
import { arrayUnique } from './arrayUnique';
import { logCritical } from './logCritical';
import { getDayOpenTime, getHourOpenTime, getMonthOpenAndClose, getTenMinuteOpenTime } from './timeHelpers';

export function ensureCron(): Cron {
  let cron = Cron.load('SINGLETON') as Cron;
  if (cron == null) {
    cron = new Cron('SINGLETON');
    cron.cron = BigInt.fromI32(-1);
    cron.primitives = new Array<string>();
    cron.derivatives = new Array<string>();
    cron.usdQuotedPrimitives = new Array<string>();
    cron.currencies = new Array<string>();
    cron.save();
  }

  return cron;
}

export function triggerCron(timestamp: BigInt): void {
  let cron = ensureCron();
  if (cron.cron.ge(timestamp)) {
    // We've been here before. No need to run the cron job.
    return;
  }

  cronWeth(cron, timestamp);
  cronDerivatives(cron, timestamp);
  cronCandles(cron, timestamp);

  cron.cron = timestamp;
  cron.save();
}

function cronWeth(cron: Cron, timestamp: BigInt): void {
  let previousWindow = getHourOpenTime(cron.cron);
  let currentWindow = getHourOpenTime(timestamp);

  // Only update the weth once per hour.
  if (!currentWindow.gt(previousWindow)) {
    return;
  }

  let asset = useAsset(wethTokenAddress.toHex());
  let current = BigDecimal.fromString('1');
  trackAssetPrice(asset, timestamp, current);
}

function cronDerivatives(cron: Cron, timestamp: BigInt): void {
  let previousWindow = getTenMinuteOpenTime(cron.cron);
  let currentWindow = getTenMinuteOpenTime(timestamp);

  // Only update the derivative prices once per time window.
  if (!currentWindow.gt(previousWindow)) {
    return;
  }

  let derivatives = cron.derivatives;
  for (let i: i32 = 0; i < derivatives.length; i++) {
    let asset = useAsset(derivatives[i]);
    let current = fetchAssetPrice(asset);
    trackAssetPrice(asset, timestamp, current);
  }
}

function cronCandles(cron: Cron, timestamp: BigInt): void {
  let currentHour = getHourOpenTime(timestamp);
  if (!currentHour.gt(getHourOpenTime(cron.cron))) {
    // Bail out early if no updates are required.
    return;
  }

  ensureHourlyPriceCandleGroup(currentHour);

  let currentDay = getDayOpenTime(timestamp);
  if (currentDay.gt(getDayOpenTime(cron.cron))) {
    ensureDailyPriceCandleGroup(currentDay);
  }

  let currentMonthStartEnd = getMonthOpenAndClose(timestamp);
  let currentCronStartEnd = getMonthOpenAndClose(cron.cron);
  if (currentMonthStartEnd[0].gt(currentCronStartEnd[0])) {
    ensureMonthlyPriceCandleGroup(currentMonthStartEnd[0], currentMonthStartEnd[1]);
  }

  let ids = arrayUnique<string>(cron.primitives.concat(cron.derivatives));
  for (let i: i32 = 0; i < ids.length; i++) {
    let asset = useAsset(ids[i]);
    if (asset.price == null) {
      logCritical('Missing price for asset {}', [asset.id]);
    }

    let price = useAssetPrice(asset.price as string);
    trackAssetPrice(asset, timestamp, price.price);
  }
}
