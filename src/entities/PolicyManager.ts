import { Address } from '@graphprotocol/graph-ts';
import { PolicyManagerContract } from '../generated/PolicyManagerContract';
import { PolicyManager } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function ensurePolicyManager(address: Address): PolicyManager {
  let policyManager = PolicyManager.load(address.toHex()) as PolicyManager;
  if (policyManager) {
    return policyManager;
  }

  let contract = PolicyManagerContract.bind(address);
  let fundDeployerCall = contract.try_getFundDeployer();
  if (fundDeployerCall.reverted) {
    logCritical('getFundDeployer() reverted for {}', [address.toHex()]);
  }

  policyManager = new PolicyManager(address.toHex());
  policyManager.release = fundDeployerCall.value.toHex();
  policyManager.save();

  return policyManager;
}
