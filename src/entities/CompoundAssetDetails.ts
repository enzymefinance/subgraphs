import { Address } from '@graphprotocol/graph-ts';
import { ICERC20 } from '../generated/ICERC20';
import { Asset, CompoundAssetDetails as CompoundAssetDetail } from '../generated/schema';

export function checkCompoundAssetDetail(derivative: Asset): void {
  if (!derivative.name.startsWith('Compound ')) {
    return;
  }

  let compound = ICERC20.bind(Address.fromString(derivative.id));

  let details = new CompoundAssetDetail(derivative.id);
  details.underlying = compound.underlying().toHex();
  details.save();

  derivative.derivativeType = 'Compound';
  derivative.compoundAssetDetail = details.id;
  derivative.save();
}
