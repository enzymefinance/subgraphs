import { Address } from '@graphprotocol/graph-ts';
import { IntegrationManagerContract } from '../generated/IntegrationManagerContract';
import { IntegrationManager } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function ensureIntegrationManager(address: Address): IntegrationManager {
  let integrationManager = IntegrationManager.load(address.toHex()) as IntegrationManager;
  if (integrationManager) {
    return integrationManager;
  }

  let contract = IntegrationManagerContract.bind(address);
  let fundDeployerCall = contract.try_getFundDeployer();
  if (fundDeployerCall.reverted) {
    logCritical('getFundDeployer() reverted for {}', [address.toHex()]);
  }

  integrationManager = new IntegrationManager(address.toHex());
  integrationManager.release = fundDeployerCall.value.toHex();
  integrationManager.save();

  return integrationManager;
}
