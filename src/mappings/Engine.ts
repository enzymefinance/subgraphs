import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import {
  AmguPaidInEther,
  AmguPriceSet,
  EtherTakerAdded,
  EtherTakerRemoved,
  FrozenEtherThawed,
  MlnTokensBurned,
} from '../generated/EngineContract';
import {
  AmguPaidInEtherEvent,
  AmguPriceSetEvent,
  EtherTakerAddedEvent,
  EtherTakerRemovedEvent,
  FrozenEtherThawedEvent,
  MlnTokensBurnedEvent,
} from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAmguPaidInEther(event: AmguPaidInEther): void {
  let amguPayment = new AmguPaidInEtherEvent(genericId(event));
  amguPayment.contract = ensureContract(event.address, 'Engine').id;
  amguPayment.timestamp = event.block.timestamp;
  amguPayment.amount = toBigDecimal(event.params.amount);
  amguPayment.transaction = ensureTransaction(event).id;
  amguPayment.save();
}

export function handleAmguPriceSet(event: AmguPriceSet): void {
  let amguPrice = new AmguPriceSetEvent(genericId(event));
  amguPrice.price = toBigDecimal(event.params.nextAmguPrice);
  amguPrice.timestamp = event.block.timestamp;
  amguPrice.contract = ensureContract(event.address, 'Engine').id;
  amguPrice.transaction = ensureTransaction(event).id;
  amguPrice.save();
}

export function handleEtherTakerAdded(event: EtherTakerAdded): void {
  let etherTaker = new EtherTakerAddedEvent(genericId(event));
  etherTaker.contract = ensureContract(event.address, 'Engine').id;
  etherTaker.timestamp = event.block.timestamp;
  etherTaker.etherTaker = event.params.etherTaker.toHex();
  etherTaker.transaction = ensureTransaction(event).id;
  etherTaker.save();
}

export function handleEtherTakerRemoved(event: EtherTakerRemoved): void {
  let etherTaker = new EtherTakerRemovedEvent(genericId(event));
  etherTaker.contract = ensureContract(event.address, 'Engine').id;
  etherTaker.timestamp = event.block.timestamp;
  etherTaker.etherTaker = event.params.etherTaker.toHex();
  etherTaker.transaction = ensureTransaction(event).id;
  etherTaker.save();
}

export function handleFrozenEtherThawed(event: FrozenEtherThawed): void {
  let etherThawed = new FrozenEtherThawedEvent(genericId(event));
  etherThawed.contract = ensureContract(event.address, 'Engine').id;
  etherThawed.timestamp = event.block.timestamp;
  etherThawed.amount = toBigDecimal(event.params.amount);
  etherThawed.transaction = ensureTransaction(event).id;
  etherThawed.save();
}

export function handleMlnTokensBurned(event: MlnTokensBurned): void {
  let tokensBurned = new MlnTokensBurnedEvent(genericId(event));
  tokensBurned.contract = ensureContract(event.address, 'Engine').id;
  tokensBurned.timestamp = event.block.timestamp;
  tokensBurned.amount = toBigDecimal(event.params.amount);
  tokensBurned.transaction = ensureTransaction(event).id;
  tokensBurned.save();
}
