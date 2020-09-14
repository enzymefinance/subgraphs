import {
  AdapterDeregistered,
  AdapterRegistered,
  CallOnIntegrationExecuted,
} from '../generated/IntegrationManagerContract';
import { genericId } from '../utils/genericId';
import { IntegrationDeregistration, CallOnIntegrationExecution } from '../generated/schema';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import { ensureAdapter, useAdapter } from '../entities/IntegrationAdapter';
import { useFund } from '../entities/Fund';
import { ensureManager } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { toBigDecimal } from '../utils/tokenValue';
import { BigDecimal } from '@graphprotocol/graph-ts';

export function handleAdapterDeregistered(event: AdapterDeregistered): void {
  let id = genericId(event);
  let deregistration = new IntegrationDeregistration(id);

  deregistration.identifier = event.params.identifier.toHex();
  deregistration.contract = ensureContract(event.params.adapter, 'IntegrationManager', event.block.timestamp).id;
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.integrationAdapter = useAdapter(event.params.adapter.toHex()).id;

  deregistration.save();
}

export function handleAdapterRegistered(event: AdapterRegistered): void {
  let id = genericId(event);
  let registration = new IntegrationDeregistration(id);

  registration.identifier = event.params.identifier.toHex();
  registration.contract = ensureContract(event.params.adapter, 'IntegrationManager', event.block.timestamp).id;
  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.integrationAdapter = ensureAdapter(event.params.adapter, event.params.identifier.toHex()).id;

  registration.save();
}

export function handleCallOnIntegrationExecuted(event: CallOnIntegrationExecuted): void {
  let id = genericId(event);
  let execution = new CallOnIntegrationExecution(id);
  let fund = useFund(event.address.toHex());
  let address = event.transaction.from;

  let incomingAssets = event.params.incomingAssets.map<string>((asset) => ensureAsset(asset).id);
  let outgoingAssets = event.params.outgoingAssets.map<string>((asset) => ensureAsset(asset).id);

  execution.contract = ensureContract(event.address, 'IntegrationManager', event.block.timestamp).id;
  execution.fund = fund.id;
  execution.account = ensureManager(address).id;
  execution.incomingAssets = incomingAssets;
  execution.incomingAssetAmounts = event.params.incomingAssetAmounts.map<BigDecimal>((amount) => toBigDecimal(amount));
  execution.outgoingAssets = outgoingAssets;
  execution.outgoingAssetAmounts = event.params.outgoingAssetAmounts.map<BigDecimal>((amount) => toBigDecimal(amount));
  execution.timestamp = event.block.timestamp;
  execution.transaction = ensureTransaction(event).id;

  execution.save();
}
