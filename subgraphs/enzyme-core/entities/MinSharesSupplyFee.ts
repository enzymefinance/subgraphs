import { Address, ethereum } from '@graphprotocol/graph-ts';
import { MinSharesSupplyFee } from '../generated/schema';
import { feeId } from './Fee';

export function ensureMinSharesSupplyFee(
  comptrollerAddress: Address,
  feeAddress: Address,
  event: ethereum.Event,
): MinSharesSupplyFee {
  let id = feeId(comptrollerAddress, feeAddress);
  let fee = MinSharesSupplyFee.load(id);

  if (fee) {
    return fee;
  }

  fee = new MinSharesSupplyFee(id);
  fee.fee = feeAddress;
  fee.feeType = 'MinSharesSupply';
  fee.comptroller = comptrollerAddress.toHex();
  fee.createdAt = event.block.timestamp.toI32();
  fee.lastSettled = 0;
  fee.settings = '';
  fee.save();

  return fee;
}
