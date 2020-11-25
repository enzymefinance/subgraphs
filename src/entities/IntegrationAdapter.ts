import { Address } from '@graphprotocol/graph-ts';
import { IIntegrationAdapterInterface } from '../generated/IIntegrationAdapterInterface';
import { IntegrationAdapter } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

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

export function extractIntegrationAdapters(ids: string[]): IntegrationAdapter[] {
  let adapters: IntegrationAdapter[] = new Array<IntegrationAdapter>();
  for (let i = 0; i < ids.length; i++) {
    let adapter = IntegrationAdapter.load(ids[i]) as IntegrationAdapter;
    if (adapter) {
      adapters = adapters.concat([adapter]);
    }
  }

  return adapters;
}
