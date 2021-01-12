import { Address } from '@graphprotocol/graph-ts';
import { IIntegrationAdapterInterface } from '../generated/IIntegrationAdapterInterface';
import { IntegrationAdapter } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensureIntegrationManager } from './IntegrationManager';

export function useIntegrationAdapter(id: string): IntegrationAdapter {
  let integrationAdapter = IntegrationAdapter.load(id) as IntegrationAdapter;
  if (integrationAdapter == null) {
    logCritical('Failed to load adapter {}.', [id]);
  }

  return integrationAdapter;
}

export function ensureIntegrationAdapter(address: Address, integrationManager: Address): IntegrationAdapter {
  let integrationAdapter = IntegrationAdapter.load(address.toHex()) as IntegrationAdapter;
  if (integrationAdapter) {
    return integrationAdapter;
  }

  let contract = IIntegrationAdapterInterface.bind(address);
  let identifierCall = contract.try_identifier();
  if (identifierCall.reverted) {
    logCritical('identifier() reverted for {}', [address.toHex()]);
  }

  integrationAdapter = new IntegrationAdapter(address.toHex());
  integrationAdapter.integrationManager = ensureIntegrationManager(integrationManager).id;
  integrationAdapter.identifier = identifierCall.value;
  integrationAdapter.save();

  return integrationAdapter;
}
