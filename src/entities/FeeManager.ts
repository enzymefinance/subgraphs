import { Address } from '@graphprotocol/graph-ts';
import { FeeManagerContract } from '../generated/FeeManagerContract';
import { FeeManager } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function ensureFeeManager(address: Address): FeeManager {
  let feeManager = FeeManager.load(address.toHex()) as FeeManager;
  if (feeManager) {
    return feeManager;
  }

  let contract = FeeManagerContract.bind(address);
  let fundDeployerCall = contract.try_getFundDeployer();
  if (fundDeployerCall.reverted) {
    logCritical('getFundDeployer() reverted for {}', [address.toHex()]);
  }

  feeManager = new FeeManager(address.toHex());
  feeManager.release = fundDeployerCall.value.toHex();
  feeManager.save();

  return feeManager;
}
