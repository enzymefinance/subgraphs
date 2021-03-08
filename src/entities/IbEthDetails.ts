import { wethTokenAddress } from '../addresses';
import { Asset, IbEthAssetDetail } from '../generated/schema';

export function checkIbEthAssetDetails(derivative: Asset): void {
  if (derivative.name != 'Interest Bearing ETH') {
    return;
  }

  let details = new IbEthAssetDetail(derivative.id);
  details.underlying = wethTokenAddress.toHex();
  details.save();

  derivative.derivativeType = 'IbEth';
  derivative.ibEthAssetDetails = details.id;
  derivative.save();
}
