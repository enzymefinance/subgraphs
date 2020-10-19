import { Entity, ethereum } from '@graphprotocol/graph-ts';
import { Fee, FeeState, Fund } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { ensureManagementFeeState } from './ManagementFeeState';
import { ensurePerformanceFeeState } from './PerformanceFeeState';
import { ensureState, useState } from './State';

export function feeStateId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/feeState';
}

export function createFeeState(
  feeStateIds: string[],
  fund: Fund,
  event: ethereum.Event,
  cause: Entity | null,
): FeeState {
  let feeState = new FeeState(feeStateId(fund, event));
  feeState.timestamp = event.block.timestamp;
  feeState.fund = fund.id;
  feeState.feeStates = feeStateIds;
  feeState.events = cause ? [cause.getString('id')] : new Array<string>();
  feeState.save();

  return feeState;
}

export function ensureFeeState(fund: Fund, event: ethereum.Event, cause: Entity): FeeState {
  let feeState = FeeState.load(feeStateId(fund, event)) as FeeState;

  if (!feeState) {
    let state = useState(fund.state);
    let previous = useFeeState(state.feeState);
    feeState = createFeeState(previous.feeStates, fund, event, cause);
  } else {
    let events = feeState.events;
    feeState.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    feeState.save();
  }

  return feeState;
}

export function useFeeState(id: string): FeeState {
  let feeState = FeeState.load(id) as FeeState;
  if (feeState == null) {
    logCritical('Failed to load fee state entity {}.', [id]);
  }

  return feeState;
}

export function trackFeeState(fund: Fund, fee: Fee, event: ethereum.Event, cause: Entity): FeeState {
  let feeState = ensureFeeState(fund, event, cause);

  if (fee.identifier == 'MANAGEMENT') {
    ensureManagementFeeState(fund, fee, event, cause);
  } else if (fee.identifier == 'PERFORMANCE') {
    ensurePerformanceFeeState(fund, fee, event, cause);
  } else {
    return feeState;
  }

  let state = ensureState(fund, event);
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(feeState.events));
  state.feeState = feeState.id;
  state.save();

  fund.feeState = feeState.id;
  fund.save();

  return feeState;
}
