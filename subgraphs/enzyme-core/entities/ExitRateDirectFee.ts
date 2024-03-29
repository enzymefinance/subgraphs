import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { ExitRateDirectFee } from '../generated/schema';
import { feeId } from './Fee';

export function ensureExitRateDirectFee(
  comptrollerAddress: Address,
  feeAddress: Address,
  event: ethereum.Event,
): ExitRateDirectFee {
  let id = feeId(comptrollerAddress, feeAddress);
  let fee = ExitRateDirectFee.load(id);

  if (fee) {
    return fee;
  }

  fee = new ExitRateDirectFee(id);
  fee.fee = feeAddress;
  fee.feeType = 'ExitRateDirect';
  fee.comptroller = comptrollerAddress.toHex();
  fee.inKindRate = BigDecimal.fromString('0');
  fee.specificAssetsRate = BigDecimal.fromString('0');
  fee.createdAt = event.block.timestamp.toI32();
  fee.settings = '';
  fee.lastSettled = 0;
  fee.save();

  return fee;
}
