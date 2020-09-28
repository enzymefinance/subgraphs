import { BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { Fee, Fund, IndividualFeePayout } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';

function individualFeePayoutId(fund: Fund, fee: Fee, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/payout/' + fee.identifier;
}

function createIndividualFeePayout(
  fund: Fund,
  fee: Fee,
  shares: BigDecimal,
  event: ethereum.Event,
  cause: Entity,
): IndividualFeePayout {
  let feePayout = new IndividualFeePayout(individualFeePayoutId(fund, fee, event));
  feePayout.timestamp = event.block.timestamp;
  feePayout.fund = fund.id;
  feePayout.fee = fee.id;
  feePayout.shares = shares;
  feePayout.events = [cause.getString('id')];
  feePayout.save();

  return feePayout;
}

export function ensureIndividualFeePayout(
  fund: Fund,
  fee: Fee,
  shares: BigDecimal,
  event: ethereum.Event,
  cause: Entity,
): IndividualFeePayout {
  let feePayout = IndividualFeePayout.load(individualFeePayoutId(fund, fee, event)) as IndividualFeePayout;

  if (!feePayout) {
    feePayout = createIndividualFeePayout(fund, fee, shares, event, cause);
  } else {
    let events = feePayout.events;
    feePayout.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    feePayout.save();
  }

  return feePayout;
}

export function useIndividualFeePayout(id: string): IndividualFeePayout {
  let feePayout = IndividualFeePayout.load(id);
  if (feePayout == null) {
    logCritical('Failed to load fee payout {}.', [id]);
  }

  return feePayout as IndividualFeePayout;
}

export function trackIndividualFee(
  fund: Fund,
  fee: Fee,
  shares: BigDecimal,
  event: ethereum.Event,
  cause: Entity,
): IndividualFeePayout {
  return ensureIndividualFeePayout(fund, fee, shares, event, cause);
}
