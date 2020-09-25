import { IntegrationAdapter } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { Address } from '@graphprotocol/graph-ts';
import { IIntegrationAdapterInterface } from '../generated/IIntegrationAdapterInterface';

export function useIntegrationAdapter(id: string): IntegrationAdapter {
  let integrationAdapter = IntegrationAdapter.load(id) as IntegrationAdapter;
  if (integrationAdapter == null) {
    logCritical('Failed to load adapter {}.', [id]);
  }

  return integrationAdapter;
}

export function ensureIntegrationAdapter(address: Address): IntegrationAdapter {
  let integrationAdapter = IntegrationAdapter.load(address.toHex()) as IntegrationAdapter;
  if (integrationAdapter) {
    return integrationAdapter;
  }

  let contract = IIntegrationAdapterInterface.bind(address);
  let identifier = contract.identifier();

  integrationAdapter = new IntegrationAdapter(address.toHex());
  integrationAdapter.identifier = identifier;
  integrationAdapter.save();

  return integrationAdapter;
}
