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
import { AmguPriceChange } from '../generated/schema';

export function handleAmguPaidInEther(event: AmguPaidInEther): void {}

export function handleAmguPriceSet(event: AmguPriceSet): void {
  let id = genericId(event);
  let amguPrice = new AmguPriceChange(id);
  amguPrice.price = toBigDecimal(event.params.nextAmguPrice);
  amguPrice.timestamp = event.block.timestamp;
  amguPrice.save();
}
export function handleEtherTakerAdded(event: EtherTakerAdded): void {}
export function handleEtherTakerRemoved(event: EtherTakerRemoved): void {}
export function handleFrozenEtherThawed(event: FrozenEtherThawed): void {}
export function handleMlnTokensBurned(event: MlnTokensBurned): void {}
