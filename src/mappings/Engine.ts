import {
  AmguPaidInEther,
  AmguPriceSet,
  EtherTakerAdded,
  EtherTakerRemoved,
  FrozenEtherThawed,
  MlnTokensBurned,
} from '../generated/EngineContract';
import { genericId } from '../utils/genericId';
import { AmguPrice } from '../generated/schema';
import { toBigDecimal } from '../utils/tokenValue';
import { createContractEvent } from '../entities/ContractEvent';

export function handleAmguPaidInEther(event: AmguPaidInEther): void {}

export function handleAmguPriceSet(event: AmguPriceSet): void {
  let id = genericId(event);
  let amguPrice = new AmguPrice(id);
  amguPrice.price = toBigDecimal(event.params.nextAmguPrice);
  amguPrice.timestamp = event.block.timestamp;
  amguPrice.save();

  createContractEvent('AmguPriceSet', event);
}
export function handleEtherTakerAdded(event: EtherTakerAdded): void {}
export function handleEtherTakerRemoved(event: EtherTakerRemoved): void {}
export function handleFrozenEtherThawed(event: FrozenEtherThawed): void {}
export function handleMlnTokensBurned(event: MlnTokensBurned): void {}
