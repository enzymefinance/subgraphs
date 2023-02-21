import { wethTokenAddress, daiAddress, usdcAddress, wbtcAddress } from '../generated/addresses';
import { Asset } from '../generated/schema';
import { ensureAsset } from '../entities/Asset';

export function notionalV2AssetByCurrencyId(type: number): Asset {
  if (type == 1) {
    return ensureAsset(wethTokenAddress);
  }

  if (type == 2) {
    return ensureAsset(daiAddress);
  }

  if (type == 3) {
    return ensureAsset(usdcAddress);
  }

  if (type == 4) {
    return ensureAsset(wbtcAddress);
  }

  return ensureAsset(wethTokenAddress);
}
