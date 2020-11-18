import { BigInt, Entity, ethereum } from '@graphprotocol/graph-ts';
import { EntranceRateDirectFeeState, Fee, Fund } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { feeStateId, useFeeState } from './FeeState';
import { useFundState } from './FundState';

class EntranceRateDirectFeeStateArgs {
  lastSettled: BigInt;
}

export function entranceRateDirectFeeStateId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/feeState/entranceRateDirect';
}

export function createEntranceRateDirectFeeState(
  fund: Fund,
  fee: Fee,
  args: EntranceRateDirectFeeStateArgs,
  event: ethereum.Event,
  cause: Entity,
): EntranceRateDirectFeeState {
  let feeState = new EntranceRateDirectFeeState(entranceRateDirectFeeStateId(fund, event));
  feeState.timestamp = event.block.timestamp;
  feeState.fund = fund.id;
  feeState.fee = fee.id;
  feeState.lastSettled = args.lastSettled;
  feeState.events = [cause.getString('id')];
  feeState.save();

  return feeState;
}

function findEntranceRateDirectFeeState(feeStates: string[]): EntranceRateDirectFeeState | null {
  for (let i: i32 = 0; i < feeStates.length; i++) {
    if (feeStates[i].endsWith('/entranceRateDirect')) {
      return EntranceRateDirectFeeState.load(feeStates[i]);
    }
  }

  return null;
}

export function ensureEntranceRateDirectFeeState(
  fund: Fund,
  fee: Fee,
  event: ethereum.Event,
  cause: Entity,
): EntranceRateDirectFeeState {
  let entranceRateDirectFeeState = EntranceRateDirectFeeState.load(
    entranceRateDirectFeeStateId(fund, event),
  ) as EntranceRateDirectFeeState;

  if (!entranceRateDirectFeeState) {
    let state = useFundState(fund.state);
    let previousFeeState = useFeeState(state.feeState);

    let previous = findEntranceRateDirectFeeState(previousFeeState.feeStates);
    if (previous) {
      entranceRateDirectFeeState = createEntranceRateDirectFeeState(
        fund,
        fee,
        { lastSettled: previous.lastSettled },
        event,
        cause,
      );

      let ids = arrayDiff<string>(previousFeeState.feeStates, [previous.id]);
      ids = arrayUnique<string>(ids.concat([entranceRateDirectFeeState.id]));

      let feeState = useFeeState(feeStateId(fund, event));
      feeState.feeStates = ids;
      feeState.save();
    } else {
      entranceRateDirectFeeState = createEntranceRateDirectFeeState(
        fund,
        fee,
        { lastSettled: BigInt.fromI32(0) },
        event,
        cause,
      );
      let feeState = useFeeState(feeStateId(fund, event));
      feeState.feeStates = feeState.feeStates.concat([entranceRateDirectFeeState.id]);
      feeState.save();
    }
  } else {
    let events = entranceRateDirectFeeState.events;
    entranceRateDirectFeeState.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    entranceRateDirectFeeState.save();
  }

  return entranceRateDirectFeeState;
}

export function useEntranceRateDirectFeeState(id: string): EntranceRateDirectFeeState {
  let feeState = EntranceRateDirectFeeState.load(id) as EntranceRateDirectFeeState;
  if (feeState == null) {
    logCritical('Failed to load entranceRateDirect fee state {}.', [id]);
  }

  return feeState;
}
