import { BigInt, Entity, ethereum } from '@graphprotocol/graph-ts';
import { EntranceRateBurnFeeState, Fee, Fund } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { feeStateId, useFeeState } from './FeeState';
import { useFundState } from './FundState';

class EntranceRateBurnFeeStateArgs {
  lastSettled: BigInt;
}

export function entranceRateBurnFeeStateId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/feeState/entranceRateBurn';
}

export function createEntranceRateBurnFeeState(
  fund: Fund,
  fee: Fee,
  args: EntranceRateBurnFeeStateArgs,
  event: ethereum.Event,
  cause: Entity,
): EntranceRateBurnFeeState {
  let feeState = new EntranceRateBurnFeeState(entranceRateBurnFeeStateId(fund, event));
  feeState.timestamp = event.block.timestamp;
  feeState.fund = fund.id;
  feeState.fee = fee.id;
  feeState.lastSettled = args.lastSettled;
  feeState.events = [cause.getString('id')];
  feeState.save();

  return feeState;
}

function findEntranceRateBurnFeeState(feeStates: string[]): EntranceRateBurnFeeState | null {
  for (let i: i32 = 0; i < feeStates.length; i++) {
    if (feeStates[i].endsWith('/entranceRateBurn')) {
      return EntranceRateBurnFeeState.load(feeStates[i]);
    }
  }

  return null;
}

export function ensureEntranceRateBurnFeeState(
  fund: Fund,
  fee: Fee,
  event: ethereum.Event,
  cause: Entity,
): EntranceRateBurnFeeState {
  let entranceRateBurnFeeState = EntranceRateBurnFeeState.load(
    entranceRateBurnFeeStateId(fund, event),
  ) as EntranceRateBurnFeeState;

  if (!entranceRateBurnFeeState) {
    let state = useFundState(fund.state);
    let previousFeeState = useFeeState(state.feeState);

    let previous = findEntranceRateBurnFeeState(previousFeeState.feeStates);
    if (previous) {
      entranceRateBurnFeeState = createEntranceRateBurnFeeState(
        fund,
        fee,
        { lastSettled: previous.lastSettled },
        event,
        cause,
      );

      let ids = arrayDiff<string>(previousFeeState.feeStates, [previous.id]);
      ids = arrayUnique<string>(ids.concat([entranceRateBurnFeeState.id]));

      let feeState = useFeeState(feeStateId(fund, event));
      feeState.feeStates = ids;
      feeState.save();
    } else {
      entranceRateBurnFeeState = createEntranceRateBurnFeeState(
        fund,
        fee,
        { lastSettled: BigInt.fromI32(0) },
        event,
        cause,
      );
      let feeState = useFeeState(feeStateId(fund, event));
      feeState.feeStates = feeState.feeStates.concat([entranceRateBurnFeeState.id]);
      feeState.save();
    }
  } else {
    let events = entranceRateBurnFeeState.events;
    entranceRateBurnFeeState.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    entranceRateBurnFeeState.save();
  }

  return entranceRateBurnFeeState;
}

export function useEntranceRateBurnFeeState(id: string): EntranceRateBurnFeeState {
  let feeState = EntranceRateBurnFeeState.load(id) as EntranceRateBurnFeeState;
  if (feeState == null) {
    logCritical('Failed to load entranceRateBurn fee state {}.', [id]);
  }

  return feeState;
}
