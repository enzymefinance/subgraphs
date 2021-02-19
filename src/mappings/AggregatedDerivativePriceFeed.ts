import { checkChai, checkSynthetix, ensureAsset } from '../entities/Asset';
import { fetchAssetPrice, trackAssetPrice } from '../entities/AssetPrice';
import { checkCompoundAssetDetail } from '../entities/CompoundAssetDetails';
import { checkUniswapV2PoolAssetDetail } from '../entities/UniswapV2PoolAssetDetails';
import {
  DerivativeAdded,
  DerivativeRemoved,
  DerivativeUpdated,
} from '../generated/AggregatedDerivativePriceFeedContract';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { ensureCron, triggerCron } from '../utils/cronManager';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let derivative = ensureAsset(event.params.derivative);
  derivative.removed = false;
  derivative.type = 'DERIVATIVE';
  derivative.save();

  checkChai(derivative);
  checkCompoundAssetDetail(derivative);
  checkUniswapV2PoolAssetDetail(derivative);
  checkSynthetix(derivative);

  // Whenever a new asset is registered, we need to fetch its current price immediately.
  let current = fetchAssetPrice(derivative);
  trackAssetPrice(derivative, event.block.timestamp, current);

  let cron = ensureCron();
  cron.derivatives = arrayUnique<string>(cron.derivatives.concat([derivative.id]));
  cron.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  let derivative = ensureAsset(event.params.derivative);
  derivative.removed = true;
  derivative.save();

  let cron = ensureCron();
  cron.derivatives = arrayDiff<string>(cron.derivatives, [derivative.id]);
  cron.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}

export function handleDerivativeUpdated(event: DerivativeUpdated): void {
  let derivative = ensureAsset(event.params.derivative);

  // Whenever a new asset is registered, we need to fetch its current price immediately.
  let current = fetchAssetPrice(derivative);
  trackAssetPrice(derivative, event.block.timestamp, current);

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}
