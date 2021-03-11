import { wethTokenAddress } from '../addresses';
import { AlphaAssetDetail, Asset } from '../generated/schema';

export function checkAlphaAssetDetails(derivative: Asset): void {
  if (derivative.name != 'Interest Bearing ETH') {
    return;
  }

  let details = new AlphaAssetDetail(derivative.id);
  details.underlying = wethTokenAddress.toHex();
  details.save();

  derivative.derivativeType = 'Alpha';
  derivative.alphaAssetDetails = details.id;
  derivative.save();
}
