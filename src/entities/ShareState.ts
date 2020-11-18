import { Address, BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { Account, Fund, ShareState } from '../generated/schema';
import { VaultLibContract } from '../generated/VaultLibContract';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import { ensureFundState, useFundState } from './FundState';
import { ensureShareholderState, findShareholderState } from './ShareholderState';

class CreateSharesArgs {
  totalSupply: BigDecimal;
  outstandingForFees: BigDecimal;
  shareholders: string[];
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
  shareState.shareholders = args.shareholders;
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
        shareholders: previous.shareholders,
      },
      event,
      cause,
    );
  } else {
    let events = shares.events;
    shares.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    shares.save();
  }

  // update ShareholderState

  return shares;
}

export function useShareState(id: string): ShareState {
  let shares = ShareState.load(id) as ShareState;
  if (shares == null) {
    logCritical('Failed to load fund shares {}.', [id]);
  }

  return shares;
}

export function trackShareState(fund: Fund, shareholders: Account[], event: ethereum.Event, cause: Entity): ShareState {
  let fundAddress = Address.fromString(fund.id);
  let contract = VaultLibContract.bind(fundAddress);
  let totalSupply = contract.totalSupply();
  let outstanding = contract.balanceOf(fundAddress);

  let shareState = ensureShareState(fund, event, cause);
  shareState.totalSupply = toBigDecimal(totalSupply);
  shareState.outstandingForFees = toBigDecimal(outstanding);

  let oldShareholderStates: string[] = new Array<string>();
  let newShareholderStates: string[] = new Array<string>();
  for (let i = 0; i < shareholders.length; i++) {
    newShareholderStates = newShareholderStates.concat([
      ensureShareholderState(fund, shareholders[i], shareState, event, cause).id,
    ]);

    let oldShareholderState = findShareholderState(shareState, shareholders[i]);
    if (oldShareholderState != null) {
      oldShareholderStates = oldShareholderStates.concat([oldShareholderState.id]);
    }
  }
  let newShareholders = arrayDiff<string>(shareState.shareholders, oldShareholderStates);
  newShareholders = arrayUnique<string>(newShareholders.concat(newShareholderStates));

  shareState.shareholders = newShareholders;

  shareState.save();

  let fundState = ensureFundState(fund, event);
  let events = fundState.events;
  fundState.events = arrayUnique<string>(events.concat(shareState.events));
  fundState.shares = shareState.id;
  fundState.save();

  fund.shares = shareState.id;
  if (fund.firstInvestment == null && !totalSupply.isZero()) {
    fund.firstInvestment = event.block.timestamp;
  }
  fund.save();

  return shareState;
}
