import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { ExitRateBurnFee } from '../generated/schema';
import { feeId } from './Fee';

export function ensureExitRateBurnFee(
  comptrollerAddress: Address,
  feeAddress: Address,
  event: ethereum.Event,
): ExitRateBurnFee {
  let id = feeId(comptrollerAddress, feeAddress);
  let fee = ExitRateBurnFee.load(id) as ExitRateBurnFee;

  if (fee) {
    return fee;
  }

  fee = new ExitRateBurnFee(id);
  fee.fee = feeAddress.toHex();
  fee.comptroller = comptrollerAddress.toHex();
  fee.inKindRate = BigDecimal.fromString('0');
  fee.specificAssetsRate = BigDecimal.fromString('0');
  fee.createdAt = event.block.timestamp;
  fee.settings = '';
  fee.lastSettled = BigInt.fromI32(0);
  fee.save();

  return fee;
}