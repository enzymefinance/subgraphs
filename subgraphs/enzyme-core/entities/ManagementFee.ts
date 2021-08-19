import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { ManagementFee } from '../generated/schema';
import { feeId } from './Fee';

export function ensureManagementFee(
  comptrollerAddress: Address,
  feeAddress: Address,
  event: ethereum.Event,
): ManagementFee {
  let id = feeId(comptrollerAddress, feeAddress);
  let fee = ManagementFee.load(id) as ManagementFee;

  if (fee) {
    return fee;
  }

  fee = new ManagementFee(id);
  fee.fee = feeAddress.toHex();
  fee.comptroller = comptrollerAddress.toHex();
  fee.scaledPerSecondRate = BigInt.fromI32(0);
  fee.createdAt = event.block.timestamp;
  fee.lastSettled = BigInt.fromI32(0);
  fee.activatedForMigratedFundAt = BigInt.fromI32(0);
  fee.settings = '';
  fee.save();

  return fee;
}
