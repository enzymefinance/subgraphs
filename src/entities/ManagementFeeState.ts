import { Entity, ethereum } from '@graphprotocol/graph-ts';
import { Fee, Fund, ManagementFeeState } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { feeStateId, useFeeState } from './FeeState';
import { useState } from './State';

function managementFeeStateId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/feeState/management';
}

export function createManagementFeeState(
  fund: Fund,
  fee: Fee,
  event: ethereum.Event,
  cause: Entity,
): ManagementFeeState {
  let feeState = new ManagementFeeState(managementFeeStateId(fund, event));
  feeState.timestamp = event.block.timestamp;
  feeState.fund = fund.id;
  feeState.fee = fee.id;
  feeState.events = [cause.getString('id')];
  feeState.save();

  return feeState;
}

function findManagementFeeState(feeStates: string[]): ManagementFeeState | null {
  for (let i: i32 = 0; i < feeStates.length; i++) {
    if (feeStates[i].endsWith('/management')) {
      return ManagementFeeState.load(feeStates[i]);
    }
  }

  return null;
}

export function ensureManagementFeeState(
  fund: Fund,
  fee: Fee,
  event: ethereum.Event,
  cause: Entity,
): ManagementFeeState {
  let managementFeeState = ManagementFeeState.load(managementFeeStateId(fund, event)) as ManagementFeeState;

  if (!managementFeeState) {
    let state = useState(fund.state);
    let previousFeeState = useFeeState(state.feeState);

    let previous = findManagementFeeState(previousFeeState.feeStates);
    if (previous) {
      managementFeeState = createManagementFeeState(fund, fee, event, cause);

      let ids = arrayDiff<string>(previousFeeState.feeStates, [previous.id]);
      ids = arrayUnique<string>(ids.concat([managementFeeState.id]));

      let feeState = useFeeState(feeStateId(fund, event));
      feeState.feeStates = ids;
      feeState.save();
    } else {
      managementFeeState = createManagementFeeState(fund, fee, event, cause);

      let feeState = useFeeState(feeStateId(fund, event));
      feeState.feeStates = feeState.feeStates.concat([managementFeeState.id]);
      feeState.save();
    }
  } else {
    let events = managementFeeState.events;
    managementFeeState.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    managementFeeState.save();
  }

  return managementFeeState;
}

export function useManagementFeeState(id: string): ManagementFeeState {
  let feeState = ManagementFeeState.load(id) as ManagementFeeState;
  if (feeState == null) {
    logCritical('Failed to load management fee state {}.', [id]);
  }

  return feeState;
}
