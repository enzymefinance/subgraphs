import { Address, Entity, ethereum } from '@graphprotocol/graph-ts';
import { Account, Fund, ShareholderState, ShareState } from '../generated/schema';
import { VaultLibContract } from '../generated/VaultLibContract';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';

export function shareholderStateId(fund: Fund, shareholder: Account, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/shareholder/' + shareholder.id;
}

export function createShareholderState(
  fund: Fund,
  shareholder: Account,
  shareState: ShareState,
  event: ethereum.Event,
  cause: Entity | null,
): ShareholderState {
  let vaultProxy = VaultLibContract.bind(Address.fromString(fund.id));
  let balance = vaultProxy.balanceOf(Address.fromString(shareholder.id));

  let shareholderState = new ShareholderState(shareholderStateId(fund, shareholder, event));
  shareholderState.timestamp = event.block.timestamp;
  shareholderState.fund = fund.id;
  shareholderState.account = shareholder.id;
  shareholderState.shares = toBigDecimal(balance);
  shareholderState.shareState = shareState.id;
  shareholderState.events = cause ? [cause.getString('id')] : new Array<string>();
  shareholderState.save();

  return shareholderState;
}

export function ensureShareholderState(
  fund: Fund,
  shareholder: Account,
  shareState: ShareState,
  event: ethereum.Event,
  cause: Entity,
): ShareholderState {
  let shareholderState = ShareholderState.load(shareholderStateId(fund, shareholder, event)) as ShareholderState;

  if (!shareholderState) {
    shareholderState = createShareholderState(fund, shareholder, shareState, event, cause);
  } else {
    let events = shareholderState.events;
    shareholderState.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    shareholderState.save();
  }

  return shareholderState;
}

export function useShareholderState(id: string): ShareholderState {
  let shares = ShareholderState.load(id) as ShareholderState;
  if (shares == null) {
    logCritical('Failed to load shareholder state {}.', [id]);
  }

  return shares;
}

export function findShareholderState(shareState: ShareState, account: Account): ShareholderState | null {
  let shareholders = shareState.shareholders;

  for (let i: i32 = 0; i < shareholders.length; i++) {
    let shareholderState = useShareholderState(shareholders[i]);
    if (shareholderState.account == account.id) {
      return shareholderState;
    }
  }

  return null;
}
