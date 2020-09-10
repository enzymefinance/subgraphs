import { Address } from '@graphprotocol/graph-ts';
import {
  AdapterDeregistered,
  AdapterRegistered,
  CallOnIntegrationExecuted,
} from '../generated/IntegrationManagerContract';
import { genericId } from '../utils/genericId';
import { IntegrationDeregistration, CallOnIntegrationExecution } from '../generated/schema';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import { ensureAdapter } from '../entities/Adapter';
import { useFund } from '../entities/Fund';
import { ensureAccount } from '../entities/Account';
import { ensureAssets } from '../entities/Asset';

export function handleAdapterDeregistered(event: AdapterDeregistered): void {
  let id = genericId(event);
  let deregistration = new IntegrationDeregistration(id);
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.contract = ensureContract(event.params.adapter, 'IntegrationManager', event.block.timestamp).id;
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.adapter = ensureAdapter(event.params.adapter, event.params.identifier.toHex()).id;
  deregistration.save();
}

export function handleAdapterRegistered(event: AdapterRegistered): void {
  let id = genericId(event);
  let registration = new IntegrationDeregistration(id);
  registration.identifier = event.params.identifier.toHex();
  registration.contract = ensureContract(event.params.adapter, 'IntegrationManager', event.block.timestamp).id;
  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.adapter = ensureAdapter(event.params.adapter, event.params.identifier.toHex()).id;
  registration.save();
}

export function handleCallOnIntegrationExecuted(event: CallOnIntegrationExecuted): void {
  let id = genericId(event);
  let execution = new CallOnIntegrationExecution(id);
  let fund = useFund(event.address.toHex());
  let address = Address.fromString(ensureTransaction(event).from);

  let incomingAssets: string[] = [];
  for (let i: i32 = 0; i < event.params.incomingAssets.length; i++) {
    incomingAssets.push(ensureAssets(event.params.incomingAssets)[i].id);
  }

  let outgoingAssets: string[] = [];
  for (let i: i32 = 0; i < event.params.outgoingAssets.length; i++) {
    outgoingAssets.push(ensureAssets(event.params.outgoingAssets)[i].id);
  }
  
  execution.contract = ensureContract(event.address, 'IntegrationManager', event.block.timestamp).id
  execution.fund = fund.id;
  execution.account = ensureAccount(address).id;
  execution.incomingAssets = incomingAssets;
  execution.incomingAssetAmounts = event.params.incomingAssetAmounts;
  execution.outgoingAssets = outgoingAssets;
  execution.outgoingAssetAmounts = event.params.outgoingAssetAmounts;
  execution.timestamp = event.block.timestamp;
  execution.transaction = ensureTransaction(event).id;

  execution.save();
}
