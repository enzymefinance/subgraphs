import { BigDecimal } from '@graphprotocol/graph-ts';
import { useAccount } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { ensureContract, useContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { ensureIntegrationAdapter, useIntegrationAdapter } from '../entities/IntegrationAdapter';
import { ensureTransaction } from '../entities/Transaction';
import {
  AdapterDeregistered,
  AdapterRegistered,
  CallOnIntegrationExecuted,
} from '../generated/IntegrationManagerContract';
import { AdapterDeregisteredEvent, AdapterRegisteredEvent, CallOnIntegrationExecutedEvent } from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/tokenValue';

export function handleAdapterRegistered(event: AdapterRegistered): void {
  let registration = new AdapterRegisteredEvent(genericId(event));
  registration.identifier = event.params.identifier.toHex();
  registration.contract = ensureContract(event.params.adapter, 'IntegrationManager', event).id;
  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.integrationAdapter = ensureIntegrationAdapter(event.params.adapter).id;
  registration.save();
}

export function handleAdapterDeregistered(event: AdapterDeregistered): void {
  let deregistration = new AdapterDeregisteredEvent(genericId(event));
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.contract = ensureContract(event.params.adapter, 'IntegrationManager', event).id;
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.integrationAdapter = useIntegrationAdapter(event.params.adapter.toHex()).id;
  deregistration.save();
}

export function handleCallOnIntegrationExecuted(event: CallOnIntegrationExecuted): void {
  let execution = new CallOnIntegrationExecutedEvent(genericId(event));
  execution.contract = useContract(event.address.toHex()).id;
  execution.fund = useFund(event.address.toHex()).id;
  execution.account = useAccount(event.params.caller.toHex()).id;
  execution.incomingAssets = event.params.incomingAssets.map<string>((asset) => ensureAsset(asset).id);
  execution.incomingAssetAmounts = event.params.incomingAssetAmounts.map<BigDecimal>((amount) => toBigDecimal(amount));
  execution.outgoingAssets = event.params.outgoingAssets.map<string>((asset) => ensureAsset(asset).id);
  execution.outgoingAssetAmounts = event.params.outgoingAssetAmounts.map<BigDecimal>((amount) => toBigDecimal(amount));
  execution.timestamp = event.block.timestamp;
  execution.transaction = ensureTransaction(event).id;
  execution.save();
}
