import { Address, BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { MockTokenContract } from '../generated/MockTokenContract';
import { Fund, Share } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import { ensureState, useState } from './State';

class CreateSharesArgs {
  totalSupply: BigDecimal;
  outstandingForFees: BigDecimal;
}

export function shareId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/shares';
}

export function createShares(fund: Fund, args: CreateSharesArgs, event: ethereum.Event, cause: Entity | null): Share {
  let entity = new Share(shareId(fund, event));
  entity.timestamp = event.block.timestamp;
  entity.fund = fund.id;
  entity.totalSupply = args.totalSupply;
  entity.outstandingForFees = args.outstandingForFees;
  entity.events = cause ? [cause.getString('id')] : new Array<string>();
  entity.save();

  return entity;
}

export function ensureShares(fund: Fund, event: ethereum.Event, cause: Entity): Share {
  let shares = Share.load(shareId(fund, event)) as Share;

  if (!shares) {
    let state = useState(fund.state);
    let previous = useShares(state.shares);
    shares = createShares(
      fund,
      { totalSupply: previous.totalSupply, outstandingForFees: previous.outstandingForFees },
      event,
      cause,
    );
  } else {
    let events = shares.events;
    shares.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    shares.save();
  }

  return shares;
}

export function useShares(id: string): Share {
  let shares = Share.load(id) as Share;
  if (shares == null) {
    logCritical('Failed to load fund shares {}.', [id]);
  }

  return shares;
}

export function trackFundShares(fund: Fund, event: ethereum.Event, cause: Entity): Share {
  let fundAddress = Address.fromString(fund.id);
  let contract = MockTokenContract.bind(fundAddress);
  let totalSupply = contract.totalSupply();
  let outstanding = contract.balanceOf(fundAddress);

  let shares = ensureShares(fund, event, cause);
  shares.totalSupply = toBigDecimal(totalSupply);
  shares.outstandingForFees = toBigDecimal(outstanding);
  shares.save();

  let state = ensureState(fund, event);
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(shares.events));
  state.shares = shares.id;
  state.save();

  fund.shares = shares.id;
  if (fund.firstInvestment == null && !totalSupply.isZero()) {
    fund.firstInvestment = event.block.timestamp;
  }
  fund.save();

  return shares;
}
