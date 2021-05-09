import { Address } from '@graphprotocol/graph-ts';
import { CompoundAdapter } from '../generated/CompoundAdapter';
import { IntegrationAdapter } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensureIntegrationManager } from './IntegrationManager';

export function ensureIntegrationAdapter(address: Address): IntegrationAdapter {
  let integrationAdapter = IntegrationAdapter.load(address.toHex()) as IntegrationAdapter;
  if (integrationAdapter) {
    return integrationAdapter;
  }

  // mis-using CompoundAdapter, because IIntegrationAdapter doesn't have getIntegrationManager()
  let contract = CompoundAdapter.bind(address);
  let identifierCall = contract.try_identifier();
  if (identifierCall.reverted) {
    logCritical('identifier() reverted for {}', [address.toHex()]);
  }

  let integrationManagerCall = contract.try_getIntegrationManager();
  if (integrationManagerCall.reverted) {
    logCritical('getIntegrationManager() reverted', []);
  }

  integrationAdapter = new IntegrationAdapter(address.toHex());
  integrationAdapter.integrationManager = ensureIntegrationManager(integrationManagerCall.value).id;
  integrationAdapter.identifier = identifierCall.value;
  integrationAdapter.save();

  return integrationAdapter;
}
