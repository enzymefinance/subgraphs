import { Address, log } from '@graphprotocol/graph-ts';
import { wethTokenAddress } from '../addresses';
import { ICERC20 } from '../generated/ICERC20';
import { Asset, CompoundAssetDetails } from '../generated/schema';

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

  let details = new CompoundAssetDetails(derivative.id);
  details.underlying = underlying;
  details.save();

  derivative.derivativeType = 'Compound';
  derivative.compoundAssetDetails = details.id;
  derivative.save();
}
