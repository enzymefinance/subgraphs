import { Address } from '@graphprotocol/graph-ts';
import { FeeManager } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useFeeManager(id: string): FeeManager {
  let feeManager = FeeManager.load(id) as FeeManager;
  if (feeManager == null) {
    logCritical('Failed to load FeeManager {}.', [id]);
  }

  return feeManager;
}

export function ensureFeeManager(address: Address): FeeManager {
  let feeManager = FeeManager.load(address.toHex()) as FeeManager;
  if (feeManager) {
    return feeManager;
  }

  feeManager = new FeeManager(address.toHex());
  feeManager.save();

  return feeManager;
}
