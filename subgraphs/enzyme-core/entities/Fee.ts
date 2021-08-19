import { Address } from '@graphprotocol/graph-ts';

export function feeId(comptrollerAddress: Address, feeAddress: Address): string {
  return comptrollerAddress.toHex() + '/' + feeAddress.toHex();
}
