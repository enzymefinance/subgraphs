import { Address, log } from '@graphprotocol/graph-ts';
import { wethTokenAddress } from '../addresses';
import { ICERC20 } from '../generated/ICERC20';
import { Asset, SingleUnderlyingAssetDetail } from '../generated/schema';

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

export function checkAlphaAssetDetails(derivative: Asset): void {
  if (derivative.name != 'Interest Bearing ETH') {
    return;
  }

  let details = new SingleUnderlyingAssetDetail(derivative.id);
  details.underlying = wethTokenAddress.toHex();
  details.save();

  derivative.derivativeType = 'Alpha';
  derivative.underlyingAsset = details.id;
  derivative.save();
}

export function checkChai(derivative: Asset): void {
  if (derivative.symbol != 'CHAI') {
    return;
  }

  derivative.derivativeType = 'Chai';
  derivative.save();
}

export function checkCompoundAssetDetails(derivative: Asset): void {
  if (!derivative.name.startsWith('Compound ')) {
    return;
  }

  let address = Address.fromString(derivative.id);

  // for Mainnet / Kovan
  // let cTokenIsCTokenContract = CTokenIsCTokenContract.bind(address);
  // let isCTokenCall = cTokenIsCTokenContract.try_isCToken();
  // if (isCTokenCall.reverted || isCTokenCall.value == false) {
  //   return;
  // }

  let compound = ICERC20.bind(address);
  let result = compound.try_underlying();
  let underlying: string = '';
  if (result.reverted) {
    // cETH doesn't have `underlying()` implemented
    if (derivative.name == 'Compound Ether') {
      underlying = wethTokenAddress.toHex();
    } else {
      log.warning('Reverted underlying() for asset {} - and asset is not Compound Ether', [derivative.id]);
      return;
    }
  } else {
    underlying = result.value.toHex();
  }

  let details = new SingleUnderlyingAssetDetail(derivative.id);
  details.underlying = underlying;
  details.save();

  derivative.derivativeType = 'Compound';
  derivative.underlyingAsset = details.id;
  derivative.save();
}
