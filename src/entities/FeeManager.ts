import { Address } from '@graphprotocol/graph-ts';
import { FeeManager } from '../generated/schema';

export function ensureFeeManager(address: Address): FeeManager {
  let feeManager = FeeManager.load(address.toHex()) as FeeManager;
  if (feeManager) {
    return feeManager;
  }

  feeManager = new FeeManager(address.toHex());
  feeManager.save();

  return feeManager;
}
