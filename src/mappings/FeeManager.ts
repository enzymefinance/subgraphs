import { ensureManager } from '../entities/Account';
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
import { FeeDeregisteredEvent, FeeEnabled, FeeRegisteredEvent } from '../generated/schema';
import { genericId } from '../utils/genericId';

export function handleFeeDeregistered(event: FeeDeregistered): void {
  let id = genericId(event);
  let deregistration = new FeeDeregisteredEvent(id);

  deregistration.contract = ensureContract(event.address, 'FeeManager', event.block.timestamp).id
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id
  deregistration.fee = useFee(event.params.fee.toHex()).id

  deregistration.save()

}

export function handleFeeEnabledForFund(event: FeeEnabledForFund): void {
  let id = genericId(event);
  let enabled = new FeeEnabled(id)


  enabled.contract = ensureContract(event.address, 'FeeManager', event.block.timestamp).id
  
  // should this be event.address? or event.transaction.from?
  enabled.fund = useFund(event.address.toHex()).id
  enabled.account = ensureManager(event.transaction.from).id




}

export function handleFeeRegistered(event: FeeRegistered): void {
  let id = genericId(event);
  let registration = new FeeRegisteredEvent(id);
  
  registration.contract = ensureContract(event.address, 'FeeManager', event.block.timestamp).id
  registration.timestamp = event.block.timestamp
  registration.transaction = ensureTransaction(event).id
  registration.fee = ensureFee(event.params.fee, event.params.identifier.toHex(), event.block.timestamp).id

  registration.save()
}
export function handleFeeSettledForFund(event: FeeSettledForFund): void {}
export function handleFeeSharesOutstandingPaidForFund(event: FeeSharesOutstandingPaidForFund): void {}
