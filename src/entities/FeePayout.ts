import { BigDecimal, BigInt, Entity, ethereum, Value } from '@graphprotocol/graph-ts';
import { Fee, FeePayout, Fund, IndividualFeePayout, State } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { trackIndividualFee, useIndividualFeePayout } from './IndividualFeePayout';

export function payoutId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/payout';
}

export function createFeePayout(
  feePayouts: IndividualFeePayout[],
  fund: Fund,
  event: ethereum.Event,
  cause: Entity | null,
): FeePayout {
  let payout = new FeePayout(payoutId(fund, event));
  payout.timestamp = event.block.timestamp;
  payout.fund = fund.id;
  payout.shares = BigDecimal.fromString('0');
  payout.payouts = feePayouts.map<string>((item) => item.id);
  payout.events = cause ? [cause.getString('id')] : [];
  payout.save();

  return payout;
}

export function ensureFeePayout(fund: Fund, state: State, event: ethereum.Event, cause: Entity): FeePayout {
  let feePayout = FeePayout.load(payoutId(fund, event)) as FeePayout;

  if (!feePayout) {
    let previous = useFeePayout(state.feePayout).payouts;
    let records = previous.map<IndividualFeePayout>((id) => useIndividualFeePayout(id));

    feePayout = createFeePayout(records, fund, event, cause);
  } else {
    let events = feePayout.events;
    feePayout.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    feePayout.save();
  }

  return feePayout;
}

export function useFeePayout(id: string): FeePayout {
  let feePayout = FeePayout.load(id) as FeePayout;
  if (feePayout == null) {
    logCritical('Failed to load payout entity {}.', [id]);
  }

  return feePayout;
}

export function trackFeePayout(
  fund: Fund,
  fee: Fee,
  shares: BigDecimal,
  state: State,
  event: ethereum.Event,
  cause: Entity,
): FeePayout {
  let feePayout = ensureFeePayout(fund, state, event, cause);
  feePayout.shares = feePayout.shares.plus(shares);

  feePayout.payouts = feePayout.payouts.concat([trackIndividualFee(fund, fee, shares, event, cause).id]);
  feePayout.save();

  let events = state.events;
  state.events = arrayUnique<string>(events.concat(feePayout.events));
  state.feePayout = feePayout.id;
  state.save();

  fund.feePayouts = feePayout.id;
  fund.save();

  return feePayout;
}
