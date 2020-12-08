import { Address, BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { Fund, ShareState } from '../generated/schema';
import { VaultLibContract } from '../generated/VaultLibContract';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import { ensureFundState, useFundState } from './FundState';

class CreateSharesArgs {
  totalSupply: BigDecimal;
  outstandingForFees: BigDecimal;
}

export function shareStateId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/shares';
}

export function createShareState(
  fund: Fund,
  args: CreateSharesArgs,
  event: ethereum.Event,
  cause: Entity | null,
): ShareState {
  let shareState = new ShareState(shareStateId(fund, event));
  shareState.timestamp = event.block.timestamp;
  shareState.fund = fund.id;
  shareState.totalSupply = args.totalSupply;
  shareState.outstandingForFees = args.outstandingForFees;
  shareState.events = cause ? [cause.getString('id')] : new Array<string>();
  shareState.save();

  return shareState;
}

export function ensureShareState(fund: Fund, event: ethereum.Event, cause: Entity): ShareState {
  let shares = ShareState.load(shareStateId(fund, event)) as ShareState;

  if (!shares) {
    let state = useFundState(fund.state);
    let previous = useShareState(state.shares);
    shares = createShareState(
      fund,
      {
        totalSupply: previous.totalSupply,
        outstandingForFees: previous.outstandingForFees,
      },
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

export function useShareState(id: string): ShareState {
  let shares = ShareState.load(id) as ShareState;
  if (shares == null) {
    logCritical('Failed to load fund shares {}.', [id]);
  }

  return shares;
}

export function trackShareState(fund: Fund, event: ethereum.Event, cause: Entity): ShareState {
  let fundAddress = Address.fromString(fund.id);
  let contract = VaultLibContract.bind(fundAddress);
  let totalSupply = contract.totalSupply();
  let outstanding = contract.balanceOf(fundAddress);

  let shareState = ensureShareState(fund, event, cause);
  shareState.totalSupply = toBigDecimal(totalSupply);
  shareState.outstandingForFees = toBigDecimal(outstanding);
  shareState.save();

  let fundState = ensureFundState(fund, event);
  let events = fundState.events;
  fundState.events = arrayUnique<string>(events.concat(shareState.events));
  fundState.shares = shareState.id;
  fundState.investmentCount = fund.investmentCount;
  fundState.save();

  fund.shares = shareState.id;

  // first investment state is needed for performance calculations
  // (initial state for asset prices, etc.)
  if (fund.firstInvestmentState == null && !totalSupply.isZero()) {
    fund.firstInvestmentState = fundState.id;
  }
  fund.save();

  return shareState;
}
