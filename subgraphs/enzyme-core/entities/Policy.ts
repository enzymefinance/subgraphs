import { Address } from '@graphprotocol/graph-ts';

export function policyId(comptrollerAddress: Address, policyAddress: Address): string {
  return comptrollerAddress.toHex() + '/' + policyAddress.toHex();
}
