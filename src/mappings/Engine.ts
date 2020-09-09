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
  AmguPaymentInEther,
  AmguPriceChange,
  FrozenEtherThaw,
  MlnTokensBurn,
  EtherTakerAddition,
  EtherTakerRemoval,
} from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/tokenValue';

export function handleAmguPaidInEther(event: AmguPaidInEther): void {
  let id = genericId(event);

  let amguPayment = new AmguPaymentInEther(id);
  amguPayment.contract = ensureContract(event.address, 'Engine', event.block.timestamp).id;
  amguPayment.timestamp = event.block.timestamp;
  amguPayment.amount = toBigDecimal(event.params.amount);
  amguPayment.transaction = ensureTransaction(event).id;
  amguPayment.save();
}

export function handleAmguPriceSet(event: AmguPriceSet): void {
  let id = genericId(event);

  let amguPrice = new AmguPriceChange(id);
  amguPrice.price = toBigDecimal(event.params.nextAmguPrice);
  amguPrice.timestamp = event.block.timestamp;
  amguPrice.contract = ensureContract(event.address, 'Engine', event.block.timestamp).id;
  amguPrice.transaction = ensureTransaction(event).id;
  amguPrice.save();
}

export function handleEtherTakerAdded(event: EtherTakerAdded): void {
  let id = genericId(event);

  let etherTaker = new EtherTakerAddition(id);
  etherTaker.contract = ensureContract(event.address, 'Engine', event.block.timestamp).id;
  etherTaker.timestamp = event.block.timestamp;
  etherTaker.etherTaker = event.params.etherTaker.toHex();
  etherTaker.transaction = ensureTransaction(event).id;
  etherTaker.save();
}

export function handleEtherTakerRemoved(event: EtherTakerRemoved): void {
  let id = genericId(event);

  let etherTaker = new EtherTakerRemoval(id);
  etherTaker.contract = ensureContract(event.address, 'Engine', event.block.timestamp).id;
  etherTaker.timestamp = event.block.timestamp;
  etherTaker.etherTaker = event.params.etherTaker.toHex();
  etherTaker.transaction = ensureTransaction(event).id;
  etherTaker.save();
}

export function handleFrozenEtherThawed(event: FrozenEtherThawed): void {
  let id = genericId(event);

  let etherThawed = new FrozenEtherThaw(id);
  etherThawed.contract = ensureContract(event.address, 'Engine', event.block.timestamp).id;
  etherThawed.timestamp = event.block.timestamp;
  etherThawed.amount = toBigDecimal(event.params.amount);
  etherThawed.transaction = ensureTransaction(event).id;
  etherThawed.save();
}

export function handleMlnTokensBurned(event: MlnTokensBurned): void {
  let id = genericId(event);

  let tokensBurned = new MlnTokensBurn(id);
  tokensBurned.contract = ensureContract(event.address, 'Engine', event.block.timestamp).id;
  tokensBurned.timestamp = event.block.timestamp;
  tokensBurned.amount = toBigDecimal(event.params.amount);
  tokensBurned.transaction = ensureTransaction(event).id;
  tokensBurned.save();
}
