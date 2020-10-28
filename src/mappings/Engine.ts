import { zeroAddress } from '../constants';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import {
  AmguPaidInEther,
  AmguPriceSet,
  EtherTakerAdded,
  EtherTakerRemoved,
  FrozenEtherThawed,
  MlnSoldAndBurned,
  ValueInterpreterSet,
} from '../generated/EngineContract';
import {
  AmguPaidInEtherEvent,
  AmguPriceSetEvent,
  EtherTakerAddedEvent,
  EtherTakerRemovedEvent,
  FrozenEtherThawedEvent,
  MlnSoldAndBurnedEvent,
  ValueInterpreterSetEvent,
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

export function handleMlnSoldAndBurned(event: MlnSoldAndBurned): void {
  let tokensBurned = new MlnSoldAndBurnedEvent(genericId(event));
  tokensBurned.contract = ensureContract(event.address, 'Engine').id;
  tokensBurned.timestamp = event.block.timestamp;
  tokensBurned.ethAmount = toBigDecimal(event.params.ethAmount);
  tokensBurned.mlnAmount = toBigDecimal(event.params.mlnAmount);
  tokensBurned.transaction = ensureTransaction(event).id;
  tokensBurned.save();
}

export function handleValueInterpreterSet(event: ValueInterpreterSet): void {
  let valueInterpreterSet = new ValueInterpreterSetEvent(genericId(event));
  valueInterpreterSet.contract = ensureContract(event.address, 'Engine').id;
  valueInterpreterSet.timestamp = event.block.timestamp;
  if (event.params.prevValueInterpreter != zeroAddress) {
    valueInterpreterSet.prevValueInterpreter = ensureContract(event.params.prevValueInterpreter, 'ValueInterpreter').id;
  }
  valueInterpreterSet.nextValueInterpreter = ensureContract(event.params.prevValueInterpreter, 'ValueInterpreter').id;
  valueInterpreterSet.transaction = ensureTransaction(event).id;
  valueInterpreterSet.save();
}
