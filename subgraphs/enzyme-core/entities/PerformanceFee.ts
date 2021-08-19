import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { PerformanceFee } from '../generated/schema';
import { feeId } from './Fee';

export function ensurePerformanceFee(
  comptrollerAddress: Address,
  feeAddress: Address,
  event: ethereum.Event,
): PerformanceFee {
  let id = feeId(comptrollerAddress, feeAddress);
  let fee = PerformanceFee.load(id) as PerformanceFee;

  if (fee) {
    return fee;
  }

  fee = new PerformanceFee(id);
  fee.fee = feeAddress.toHex();
  fee.comptroller = comptrollerAddress.toHex();
  fee.rate = BigDecimal.fromString('0');
  fee.period = BigInt.fromI32(0);
  fee.activatedAt = BigInt.fromI32(0);
  fee.createdAt = event.block.timestamp;
  fee.lastPaid = BigInt.fromI32(0);
  fee.settings = '';
  fee.highWaterMark = BigDecimal.fromString('0');
  fee.lastSharePrice = BigDecimal.fromString('0');
  fee.aggregateValueDue = BigDecimal.fromString('0');
  fee.sharesOutstanding = BigDecimal.fromString('0');
  fee.save();

  return fee;
}
