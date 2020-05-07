import { Entity, Value, BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts';
import { Fee } from './Fee';
import { Context } from '../context';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { ManagementFeePayout, PerformanceFeePayout } from '../generated/schema';
import { PerformanceFeeContract } from '../generated/PerformanceFeeContract';

function feePayoutId(fee: Fee, context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/fee/' + fee.identifier;
}

function createManagementFeePayout(fee: Fee, shares: BigDecimal, cause: Entity, context: Context): ManagementFeePayout {
  let event = context.event;
  let fund = context.entities.fund;
  let feePayout = new ManagementFeePayout(feePayoutId(fee, context));
  feePayout.timestamp = event.block.timestamp;
  feePayout.fund = fund.id;
  feePayout.fee = fee.id;
  feePayout.shares = shares;
  feePayout.events = [cause.getString('id')];
  feePayout.save();

  return feePayout;
}

function createPerformanceFeePayout(
  fee: Fee,
  shares: BigDecimal,
  cause: Entity,
  context: Context,
): PerformanceFeePayout {
  let event = context.event;
  let fund = context.entities.fund;

  let feeManagerAddress = Address.fromString(context.fees);
  let perfFeeContract = PerformanceFeeContract.bind(Address.fromString(fee.id.split('/')[1]));

  let feePayout = new PerformanceFeePayout(feePayoutId(fee, context));
  feePayout.timestamp = event.block.timestamp;
  feePayout.fund = fund.id;
  feePayout.fee = fee.id;
  feePayout.shares = shares;

  feePayout.highWaterMark = perfFeeContract.highWaterMark(feeManagerAddress).toBigDecimal();
  feePayout.events = [cause.getString('id')];
  feePayout.save();

  return feePayout;
}

export function ensureManagementFeePayout(
  fee: Fee,
  shares: BigDecimal,
  cause: Entity,
  context: Context,
): ManagementFeePayout {
  let feePayout = ManagementFeePayout.load(feePayoutId(fee, context)) as ManagementFeePayout;

  if (!feePayout) {
    feePayout = createManagementFeePayout(fee, shares, cause, context);
  } else {
    let events = feePayout.events;
    feePayout.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    feePayout.save();
  }

  return feePayout;
}

export function ensurePerformanceFeePayout(
  fee: Fee,
  shares: BigDecimal,
  cause: Entity,
  context: Context,
): PerformanceFeePayout {
  let feePayout = PerformanceFeePayout.load(feePayoutId(fee, context)) as PerformanceFeePayout;

  if (!feePayout) {
    feePayout = createPerformanceFeePayout(fee, shares, cause, context);
    let fund = context.entities.fund;
  } else {
    let events = feePayout.events;
    feePayout.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    feePayout.save();
  }

  return feePayout;
}

export function useManagementFeePayout(id: string): ManagementFeePayout {
  let feePayout = ManagementFeePayout.load(id);
  if (feePayout == null) {
    logCritical('Failed to load fee payout {}.', [id]);
  }

  return feePayout as ManagementFeePayout;
}

export function usePerformanceFeePayout(id: string): PerformanceFeePayout {
  let feePayout = PerformanceFeePayout.load(id);
  if (feePayout == null) {
    logCritical('Failed to load fee payout {}.', [id]);
  }

  return feePayout as PerformanceFeePayout;
}

export class IndividualPayout extends Entity {
  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get fund(): string {
    let value = this.get('fund');
    return value.toString();
  }

  set fund(value: string) {
    this.set('fund', Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get('timestamp');
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set('timestamp', Value.fromBigInt(value));
  }

  get shares(): BigDecimal {
    let value = this.get('shares');
    return value.toBigDecimal();
  }

  set shares(value: BigDecimal) {
    this.set('shares', Value.fromBigDecimal(value));
  }

  get events(): Array<string> {
    let value = this.get('events');
    return value.toStringArray();
  }

  set events(value: Array<string>) {
    this.set('events', Value.fromStringArray(value));
  }
}
