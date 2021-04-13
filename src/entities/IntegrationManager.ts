import { Address } from '@graphprotocol/graph-ts';
import { IntegrationManager } from '../generated/schema';

export function ensureIntegrationManager(address: Address): IntegrationManager {
  let integrationManager = IntegrationManager.load(address.toHex()) as IntegrationManager;
  if (integrationManager) {
    return integrationManager;
  }

  integrationManager = new IntegrationManager(address.toHex());
  integrationManager.save();

  return integrationManager;
}
