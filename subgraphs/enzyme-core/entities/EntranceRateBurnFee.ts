import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { EntranceRateBurnFee } from '../generated/schema';
import { feeId } from './Fee';

export function ensureEntranceRateBurnFee(
  comptrollerAddress: Address,
  feeAddress: Address,
  event: ethereum.Event,
): EntranceRateBurnFee {
  let id = feeId(comptrollerAddress, feeAddress);
  let fee = EntranceRateBurnFee.load(id);

  if (fee) {
    return fee;
  }

  fee = new EntranceRateBurnFee(id);
  fee.fee = feeAddress;
  fee.type = 'EntranceRateBurn';
  fee.comptroller = comptrollerAddress.toHex();
  fee.rate = BigDecimal.fromString('0');
  fee.createdAt = event.block.timestamp.toI32();
  fee.settings = '';
  fee.lastSettled = 0;
  fee.save();

  return fee;
}
