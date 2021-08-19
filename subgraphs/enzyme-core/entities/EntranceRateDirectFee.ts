import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { EntranceRateDirectFee } from '../generated/schema';
import { feeId } from './Fee';

export function ensureEntranceRateDirectFee(
  comptrollerAddress: Address,
  feeAddress: Address,
  event: ethereum.Event,
): EntranceRateDirectFee {
  let id = feeId(comptrollerAddress, feeAddress);
  let fee = EntranceRateDirectFee.load(id) as EntranceRateDirectFee;

  if (fee) {
    return fee;
  }

  fee = new EntranceRateDirectFee(id);
  fee.fee = feeAddress.toHex();
  fee.comptroller = comptrollerAddress.toHex();
  fee.rate = BigDecimal.fromString('0');
  fee.createdAt = event.block.timestamp;
  fee.settings = '';
  fee.lastSettled = BigInt.fromI32(0);
  fee.save();

  return fee;
}
