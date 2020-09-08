import {
  AdapterDeregistered,
  AdapterRegistered,
  CallOnIntegrationExecuted,
} from '../generated/IntegrationManagerContract';

export function handleAdapterDeregistered(event: AdapterDeregistered): void {}
export function handleAdapterRegistered(event: AdapterRegistered): void {}
export function handleCallOnIntegrationExecuted(event: CallOnIntegrationExecuted): void {}
