import {
  AmguPaidInEther,
  AmguPriceSet,
  EtherTakerAdded,
  EtherTakerRemoved,
  FrozenEtherThawed,
  MlnTokensBurned,
} from '../generated/EngineContract';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/tokenValue';
import { AmguPriceChange, MlnTokensBurn } from '../generated/schema';
import { ensureTransaction } from '../entities/Transaction';
import { ensureContract } from '../entities/Contract';

export function handleAmguPaidInEther(event: AmguPaidInEther): void {}

export function handleAmguPriceSet(event: AmguPriceSet): void {
  let id = genericId(event);

  let amguPrice = new AmguPriceChange(id);
  amguPrice.price = toBigDecimal(event.params.nextAmguPrice);
  amguPrice.timestamp = event.block.timestamp;
  amguPrice.contract = ensureContract(event.address, 'Engine', event.block.timestamp).id;
  amguPrice.transaction = ensureTransaction(event).id;
  amguPrice.save();
}
export function handleEtherTakerAdded(event: EtherTakerAdded): void {}
export function handleEtherTakerRemoved(event: EtherTakerRemoved): void {}
export function handleFrozenEtherThawed(event: FrozenEtherThawed): void {}
export function handleMlnTokensBurned(event: MlnTokensBurned): void {
  let id = genericId(event);

  let tokensBurned = new MlnTokensBurn(id);
  tokensBurned.contract = ensureContract(event.address, 'Engine', event.block.timestamp).id;
  tokensBurned.timestamp = event.block.timestamp;
  tokensBurned.amount = toBigDecimal(event.params.amount);
  tokensBurned.transaction = ensureTransaction(event).id;
  tokensBurned.save();
}
