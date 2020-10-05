import { BigInt } from '@graphprotocol/graph-ts';
import { useAsset } from '../entities/Asset';
import { trackAssetPrice, useAssetPrice } from '../entities/AssetPrice';
import {
  ensureDailyAssetPriceCandleGroup,
  ensureHourlyAssetPriceCandleGroup,
  ensureWeeklyAssetPriceCandleGroup,
} from '../entities/AssetPriceCandleGroup';
import { Cron } from '../generated/schema';
import { arrayUnique } from './arrayUnique';
import { logCritical } from './logCritical';
import { getDayOpenTime, getHourOpenTime, getTenMinuteOpenTime, getWeekOpenTime } from './timeHelpers';
import { fetchAssetPrice } from './valueInterpreter';

export function ensureCron(): Cron {
  let cron = Cron.load('SINGLETON') as Cron;
  if (cron == null) {
    cron = new Cron('SINGLETON');
    cron.cron = BigInt.fromI32(-1);
    cron.primitives = [];
    cron.derivatives = [];
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

  cronDerivatives(cron, timestamp);
  cronCandles(cron, timestamp);

  cron.cron = timestamp;
  cron.save();
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
    trackAssetPrice(asset, current, timestamp);
  }
}

function cronCandles(cron: Cron, timestamp: BigInt): void {
  let currentHour = getHourOpenTime(timestamp);
  if (!currentHour.gt(getHourOpenTime(cron.cron))) {
    // Bail out early if no updates are required.
    return;
  }

  ensureHourlyAssetPriceCandleGroup(currentHour);

  let currentDay = getDayOpenTime(timestamp);
  if (currentDay.gt(getDayOpenTime(cron.cron))) {
    ensureDailyAssetPriceCandleGroup(currentDay);
  }

  let currentWeek = getWeekOpenTime(timestamp);
  if (currentWeek.gt(getWeekOpenTime(cron.cron))) {
    ensureWeeklyAssetPriceCandleGroup(currentWeek);
  }

  let ids = arrayUnique<string>(cron.primitives.concat(cron.derivatives));
  for (let i: i32 = 0; i < ids.length; i++) {
    let asset = useAsset(ids[i]);
    if (!asset.price) {
      logCritical('Missing price for asset {}', [asset.id]);
    }

    let price = useAssetPrice(asset.price as string);
    trackAssetPrice(asset, price.price, timestamp);
  }
}
