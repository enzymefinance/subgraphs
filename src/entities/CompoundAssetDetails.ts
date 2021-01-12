import { Address, log } from '@graphprotocol/graph-ts';
import { wethTokenAddress } from '../addresses';
import { ICERC20 } from '../generated/ICERC20';
import { Asset, CompoundAssetDetails as CompoundAssetDetail } from '../generated/schema';

export function checkCompoundAssetDetail(derivative: Asset): void {
  // TODO: This check is not good enough.
  // There is a method `isCToken` on all cTokens, we might want to use that

  if (!derivative.name.startsWith('Compound ')) {
    return;
  }

  let compound = ICERC20.bind(Address.fromString(derivative.id));
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

  let details = new CompoundAssetDetail(derivative.id);
  details.underlying = underlying;
  details.save();

  derivative.derivativeType = 'Compound';
  derivative.compoundAssetDetail = details.id;
  derivative.save();
}
