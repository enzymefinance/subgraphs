import { BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { Fee, Fund, ManagementFeePayout, PerformanceFeePayout } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';

function individualFeePayoutId(fund: Fund, fee: Fee, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/payout/' + fee.identifier;
}

function createManagementFeePayout(
  fund: Fund,
  fee: Fee,
  shares: BigDecimal,
  event: ethereum.Event,
  cause: Entity,
): ManagementFeePayout {
  let feePayout = new ManagementFeePayout(individualFeePayoutId(fund, fee, event));
  feePayout.timestamp = event.block.timestamp;
  feePayout.fund = fund.id;
  feePayout.fee = fee.id;
  feePayout.shares = shares;
  feePayout.events = [cause.getString('id')];
  feePayout.save();

  return feePayout;
}

export function ensureManagementFeePayout(
  fund: Fund,
  fee: Fee,
  shares: BigDecimal,
  event: ethereum.Event,
  cause: Entity,
): ManagementFeePayout {
  let feePayout = ManagementFeePayout.load(individualFeePayoutId(fund, fee, event)) as ManagementFeePayout;

  if (!feePayout) {
    feePayout = createManagementFeePayout(fund, fee, shares, event, cause);
  } else {
    let events = feePayout.events;
    feePayout.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    feePayout.save();
  }

  return feePayout;
}

export function useManagementFeePayout(id: string): ManagementFeePayout {
  let feePayout = ManagementFeePayout.load(id) as ManagementFeePayout;
  if (feePayout == null) {
    logCritical('Failed to load fee payout {}.', [id]);
  }

  return feePayout;
}

function createPerformanceFeePayout(
  fund: Fund,
  fee: Fee,
  shares: BigDecimal,
  event: ethereum.Event,
  cause: Entity,
): PerformanceFeePayout {
  let feePayout = new PerformanceFeePayout(individualFeePayoutId(fund, fee, event));
  feePayout.timestamp = event.block.timestamp;
  feePayout.fund = fund.id;
  feePayout.fee = fee.id;
  feePayout.shares = shares;
  feePayout.events = [cause.getString('id')];
  // TODO: get correct values
  feePayout.grossSharePrice = BigDecimal.fromString('0');
  feePayout.hwm = BigDecimal.fromString('0');
  feePayout.save();

  return feePayout;
}

export function ensurePerformanceFeePayout(
  fund: Fund,
  fee: Fee,
  shares: BigDecimal,
  event: ethereum.Event,
  cause: Entity,
): PerformanceFeePayout {
  let feePayout = PerformanceFeePayout.load(individualFeePayoutId(fund, fee, event)) as PerformanceFeePayout;

  if (!feePayout) {
    feePayout = createPerformanceFeePayout(fund, fee, shares, event, cause);
  } else {
    let events = feePayout.events;
    feePayout.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    feePayout.save();
  }

  return feePayout;
}

export function usePerformanceFeePayout(id: string): ManagementFeePayout {
  let feePayout = ManagementFeePayout.load(id) as ManagementFeePayout;
  if (feePayout == null) {
    logCritical('Failed to load fee payout {}.', [id]);
  }

  return feePayout;
}
