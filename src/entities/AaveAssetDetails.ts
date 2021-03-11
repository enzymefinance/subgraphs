import { Asset } from '../generated/schema';

export function checkAaveAssetDetails(derivative: Asset): void {
  if (!derivative.name.startsWith('Aave interest bearing')) {
    return;
  }

  // TODO: get underlying token
  // - either through a contract call (need to store ABI)
  // - or through observing events on the AavePriceFeed

  // let details = new AaveAssetDetail(derivative.id);
  // details.underlying = wethTokenAddress.toHex();
  // details.save();

  derivative.derivativeType = 'Aave';
  // derivative.aaveAssetDetails = details.id;
  derivative.save();
}
