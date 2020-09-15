import { ensureManager } from '../entities/Account';
import { ensureComptroller, useComptroller } from '../entities/Comptroller';
import { ensureContract } from '../entities/Contract';
import { ensureFee, useFee } from '../entities/Fee';
import { useFund } from '../entities/Fund';
import { ensureTransaction } from '../entities/Transaction';
import {
  FeeDeregistered,
  FeeEnabledForFund,
  FeeRegistered,
  FeeSettledForFund,
  FeeSharesOutstandingPaidForFund,
} from '../generated/FeeManagerContract';
import {
  FeeDeregisteredEvent,
  FeeEnabledForFundEvent,
  FeeRegisteredEvent,
  FeeSettledForFundEvent,
  FeeSharesOutstandingPaidForFundEvent,
} from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/tokenValue';

export function handleFeeDeregistered(event: FeeDeregistered): void {
  let id = genericId(event);
  let deregistration = new FeeDeregisteredEvent(id);

  deregistration.contract = ensureContract(event.address, 'FeeManager', event).id;
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.fee = useFee(event.params.fee.toHex()).id;

  deregistration.save();
}

export function handleFeeEnabledForFund(event: FeeEnabledForFund): void {
  let id = genericId(event);
  let enabled = new FeeEnabledForFundEvent(id);

  enabled.fund = useFund(event.address.toHex()).id;
  enabled.contract = ensureContract(event.address, 'FeeManager', event).id;
  enabled.account = ensureManager(event.transaction.from, event).id;
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.fee = ensureFee(event.params.fee).id;
  enabled.comptrollerProxy = ensureComptroller(event.params.comptrollerProxy).id;
  enabled.settingsData = event.params.settingsData;

  enabled.save();
}

export function handleFeeRegistered(event: FeeRegistered): void {
  let id = genericId(event);
  let registration = new FeeRegisteredEvent(id);

  registration.contract = ensureContract(event.address, 'FeeManager', event).id;
  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.fee = ensureFee(event.params.fee).id;

  registration.save();
}

export function handleFeeSettledForFund(event: FeeSettledForFund): void {
  let id = genericId(event);
  let settled = new FeeSettledForFundEvent(id);
  // this seems wrong - passing event.address to both contract and fund?
  let fund = useFund(event.address.toHex()).id;

  settled.contract = ensureContract(event.address, 'FeeManager', event).id;
  settled.fund = fund;
  settled.account = ensureManager(event.transaction.from, event).id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.comptrollerProxy = useComptroller(event.params.comptrollerProxy.toHex()).id;
  settled.fee = useFee(event.params.fee.toHex()).id;
  settled.payer = fund;
  settled.sharesDue = toBigDecimal(event.params.sharesDue);
  // because it's always called by the manager, this will always have a 'to', right?
  settled.payee = ensureManager(event.transaction.to!, event).id;

  settled.save()
}

export function handleFeeSharesOutstandingPaidForFund(event: FeeSharesOutstandingPaidForFund): void {
  let id = genericId(event);
  let sharesPaid = new FeeSharesOutstandingPaidForFundEvent(id);
  // this seems wrong - passing event.address to both contract and fund?
  let fund = useFund(event.address.toHex()).id;
  
  sharesPaid.contract = ensureContract(event.address, 'FeeManager', event).id;
  sharesPaid.fund = fund;
  sharesPaid.account = ensureManager(event.transaction.from, event).id;
  sharesPaid.timestamp = event.block.timestamp;
  sharesPaid.transaction = ensureTransaction(event).id;
  sharesPaid.comptrollerProxy = useComptroller(event.params.comptrollerProxy.toHex()).id;
  sharesPaid.fee = useFee(event.params.fee.toHex()).id;
  sharesPaid.payer = fund;
  sharesPaid.sharesDue = toBigDecimal(event.params.sharesDue);
  // because it's always called by the manager, this will always have a 'to', right?
  sharesPaid.payee = ensureManager(event.transaction.to!, event).id;

  sharesPaid.save()
}


