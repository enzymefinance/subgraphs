import { Address, log } from '@graphprotocol/graph-ts';
import { ICERC20 } from '../generated/ICERC20';
import { Asset, CompoundAssetDetails as CompoundAssetDetail } from '../generated/schema';

export function checkCompoundAssetDetail(derivative: Asset): void {
  // TODO: This check is not good enough.
  if (!derivative.name.startsWith('Compound ')) {
    return;
  }

  let compound = ICERC20.bind(Address.fromString(derivative.id));
  let result = compound.try_underlying();
  if (result.reverted) {
    log.warning('Reverted underlying() for asset {}', [derivative.id]);
    return;
  }

  let details = new CompoundAssetDetail(derivative.id);
  details.underlying = result.value.toHex();
  details.save();

  derivative.derivativeType = 'Compound';
  derivative.compoundAssetDetail = details.id;
  derivative.save();
}
