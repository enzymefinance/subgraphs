import { BigDecimal } from '@graphprotocol/graph-ts';
import { useAccount } from '../entities/Account';
import { useAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
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
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAdapterRegistered(event: AdapterRegistered): void {
  let registration = new AdapterRegisteredEvent(genericId(event));
  registration.contract = ensureContract(event.params.adapter, 'IntegrationManager').id;
  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.integrationAdapter = ensureIntegrationAdapter(event.params.adapter).id;
  registration.identifier = event.params.identifier.toHex();
  registration.save();
}

export function handleAdapterDeregistered(event: AdapterDeregistered): void {
  let deregistration = new AdapterDeregisteredEvent(genericId(event));
  deregistration.contract = ensureContract(event.params.adapter, 'IntegrationManager').id;
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.integrationAdapter = useIntegrationAdapter(event.params.adapter.toHex()).id;
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.save();
}

export function handleCallOnIntegrationExecuted(event: CallOnIntegrationExecuted): void {
  let execution = new CallOnIntegrationExecutedEvent(genericId(event));
  execution.contract = event.address.toHex();
  execution.fund = useFund(event.address.toHex()).id;
  execution.account = useAccount(event.params.caller.toHex()).id;
  execution.incomingAssets = event.params.incomingAssets.map<string>((asset) => useAsset(asset.toHex()).id);
  execution.incomingAssetAmounts = event.params.incomingAssetAmounts.map<BigDecimal>((amount) => toBigDecimal(amount));
  execution.outgoingAssets = event.params.outgoingAssets.map<string>((asset) => useAsset(asset.toHex()).id);
  execution.outgoingAssetAmounts = event.params.outgoingAssetAmounts.map<BigDecimal>((amount) => toBigDecimal(amount));
  execution.timestamp = event.block.timestamp;
  execution.transaction = ensureTransaction(event).id;
  execution.save();
}
