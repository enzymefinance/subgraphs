import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { PerformanceFee } from '../generated/schema';
import { feeId } from './Fee';

export function ensurePerformanceFee(
  comptrollerAddress: Address,
  feeAddress: Address,
  performanceFeeType: string,
  event: ethereum.Event,
): PerformanceFee {
  let id = feeId(comptrollerAddress, feeAddress);
  let fee = PerformanceFee.load(id);

  if (fee) {
    return fee;
  }

  fee = new PerformanceFee(id);
  fee.fee = feeAddress;
  fee.feeType = 'Performance';
  fee.comptroller = comptrollerAddress.toHex();
  fee.rate = BigDecimal.fromString('0');
  fee.period = 0;
  fee.activatedAt = 0;
  fee.createdAt = event.block.timestamp.toI32();
  fee.lastPaid = 0;
  fee.lastSettled = 0;
  fee.settings = '';
  fee.highWaterMark = BigDecimal.fromString('0');
  fee.lastSharePrice = BigDecimal.fromString('0');
  fee.aggregateValueDue = BigDecimal.fromString('0');
  fee.sharesOutstanding = BigDecimal.fromString('0');
  fee.performanceFeeType = performanceFeeType;
  fee.save();

  return fee;
}
