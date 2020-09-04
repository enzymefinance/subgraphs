import { Fund, Share } from '../generated/schema';
import { ethereum, BigDecimal, Entity, Address } from '@graphprotocol/graph-ts';
import { logCritical } from '../utils/logCritical';
import { arrayUnique } from '../utils/arrayUnique';
import { useState, ensureState } from './State';
import { toBigDecimal } from '../utils/tokenValue';
import { StandardERC20Contract } from '../generated/StandardERC20Contract';

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
  let shares = Share.load(id);
  if (shares == null) {
    logCritical('Failed to load fund shares {}.', [id]);
  }

  return shares as Share;
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
  fund.save();

  return shares;
}
