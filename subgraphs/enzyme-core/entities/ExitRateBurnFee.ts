import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { ExitRateBurnFee } from '../generated/schema';
import { feeId } from './Fee';

export function ensureExitRateBurnFee(
  comptrollerAddress: Address,
  feeAddress: Address,
  event: ethereum.Event,
): ExitRateBurnFee {
  let id = feeId(comptrollerAddress, feeAddress);
  let fee = ExitRateBurnFee.load(id);

  if (fee) {
    return fee;
  }

  fee = new ExitRateBurnFee(id);
  fee.fee = feeAddress;
  fee.feeType = 'ExitRateBurn';
  fee.comptroller = comptrollerAddress.toHex();
  fee.inKindRate = BigDecimal.fromString('0');
  fee.specificAssetsRate = BigDecimal.fromString('0');
  fee.createdAt = event.block.timestamp.toI32();
  fee.settings = '';
  fee.lastSettled = 0;
  fee.save();

  return fee;
}
