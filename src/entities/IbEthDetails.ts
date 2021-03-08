import { wethTokenAddress } from '../addresses';
import { Asset, IbEthAssetDetails } from '../generated/schema';

export function checkIbEthAssetDetails(derivative: Asset): void {
  if (derivative.name != 'Interest Bearing ETH') {
    return;
  }

  let details = new IbEthAssetDetails(derivative.id);
  details.underlying = wethTokenAddress.toHex();
  details.save();

  derivative.derivativeType = 'IbEth';
  derivative.ibEthAssetDetails = details.id;
  derivative.save();
}
