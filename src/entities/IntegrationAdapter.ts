import { IntegrationAdapter } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { Address } from '@graphprotocol/graph-ts';

export function useIntegrationAdapter(id: string): IntegrationAdapter {
  let integrationAdapter = IntegrationAdapter.load(id);
  if (integrationAdapter == null) {
    logCritical('Failed to load adapter {}.', [id]);
  }

  return integrationAdapter as IntegrationAdapter;
}

export function ensureIntegrationAdapter(address: Address, identifier: string): IntegrationAdapter {
  let integrationAdapter = IntegrationAdapter.load(address.toHex()) as IntegrationAdapter;
  if (integrationAdapter) {
    return integrationAdapter;
  }

  integrationAdapter = new IntegrationAdapter(address.toHex());
  integrationAdapter.identifier = identifier;
  integrationAdapter.save();

  return integrationAdapter;
}
