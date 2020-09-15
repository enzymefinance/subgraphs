import { IntegrationAdapter } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { Address } from '@graphprotocol/graph-ts';

export function useAdapter(id: string): IntegrationAdapter {
  let integrationAdapter = IntegrationAdapter.load(id);
  if (integrationAdapter == null) {
    logCritical('Failed to load adapter {}.', [id]);
  }

  return integrationAdapter as IntegrationAdapter;
}

export function ensureAdapter(address: Address, identifier: string): IntegrationAdapter {
  let integrationAdapter = IntegrationAdapter.load(address.toHex()) as IntegrationAdapter;
  if (integrationAdapter) {
    return integrationAdapter;
  }

  integrationAdapter = new IntegrationAdapter(address.toHex());
  integrationAdapter.identifier = identifier;
  integrationAdapter.save();

  return integrationAdapter;
}
