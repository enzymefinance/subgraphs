import { Address, BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { Fund, Share } from '../generated/schema';
import { StandardERC20Contract } from '../generated/StandardERC20Contract';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import { ensureState, useState } from './State';

export function shareId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/shares';
}

export function createShares(shares: BigDecimal, fund: Fund, event: ethereum.Event, cause: Entity | null): Share {
  let entity = new Share(shareId(fund, event));
  entity.timestamp = event.block.timestamp;
  entity.fund = fund.id;
  entity.shares = shares;
  entity.events = cause ? [cause.getString('id')] : [];
  entity.save();

  return entity;
}

export function ensureShares(fund: Fund, event: ethereum.Event, cause: Entity): Share {
  let shares = Share.load(shareId(fund, event)) as Share;

  if (!shares) {
    let aggregate = useState(fund.state);
    let previous = useShares(aggregate.shares);
    shares = createShares(previous.shares, fund, event, cause);
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
  let totalSupply = StandardERC20Contract.bind(Address.fromString(fund.id)).totalSupply();

  let shares = ensureShares(fund, event, cause);
  shares.shares = toBigDecimal(totalSupply);
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
