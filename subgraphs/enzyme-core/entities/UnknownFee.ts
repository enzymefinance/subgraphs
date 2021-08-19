import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { UnknownFee } from '../generated/schema';
import { feeId } from './Fee';

export function ensureUnknownFee(comptrollerAddress: Address, feeAddress: Address, event: ethereum.Event): UnknownFee {
  let id = feeId(comptrollerAddress, feeAddress);
  let fee = UnknownFee.load(id) as UnknownFee;

  if (fee) {
    return fee;
  }

  fee = new UnknownFee(id);
  fee.fee = feeAddress.toHex();
  fee.comptroller = comptrollerAddress.toHex();
  fee.createdAt = event.block.timestamp;
  fee.lastSettled = BigInt.fromI32(0);
  fee.settings = '';
  fee.save();

  return fee;
}
