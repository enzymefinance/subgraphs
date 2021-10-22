import { Address } from '@graphprotocol/graph-ts';
import { Depositor } from '../generated/schema';

export function getOrCreateDepositor(address: Address): Depositor {
  let id = address.toHex();
  let depositor = Depositor.load(id);
  if (depositor == null) {
    depositor = new Depositor(id);
    depositor.save();
  }

  return depositor;
}
