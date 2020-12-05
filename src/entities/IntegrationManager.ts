import { Address } from '@graphprotocol/graph-ts';
import { IntegrationManagerContract } from '../generated/IntegrationManagerContract';
import { IntegrationManager } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useIntegrationManager(id: string): IntegrationManager {
  let integrationManager = IntegrationManager.load(id) as IntegrationManager;
  if (integrationManager == null) {
    logCritical('Failed to load IntegrationManager {}.', [id]);
  }

  return integrationManager;
}

export function ensureIntegrationManager(address: Address): IntegrationManager {
  let integrationManager = IntegrationManager.load(address.toHex()) as IntegrationManager;
  if (integrationManager) {
    return integrationManager;
  }

  let contract = IntegrationManagerContract.bind(address);

  integrationManager = new IntegrationManager(address.toHex());
  integrationManager.trackedAssetsLimit = contract.getTrackedAssetsLimit();
  integrationManager.save();

  return integrationManager;
}
