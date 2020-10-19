import { BigDecimal, Entity, ethereum, log } from '@graphprotocol/graph-ts';
import { Fee, Fund, PerformanceFeeState } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { feeStateId, useFeeState } from './FeeState';
import { stateId, useState } from './State';

class PerformanceFeeStateArgs {
  grossSharePrice: BigDecimal;
  highWaterMark: BigDecimal;
  aggregateValueDue: BigDecimal;
}

export function performanceFeeStateId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/feeState/performance';
}

function createPerformanceFeeState(
  fund: Fund,
  fee: Fee,
  args: PerformanceFeeStateArgs,
  event: ethereum.Event,
  cause: Entity,
): PerformanceFeeState {
  let performanceFeeState = new PerformanceFeeState(performanceFeeStateId(fund, event));
  performanceFeeState.timestamp = event.block.timestamp;
  performanceFeeState.fund = fund.id;
  performanceFeeState.fee = fee.id;
  performanceFeeState.events = [cause.getString('id')];
  performanceFeeState.grossSharePrice = args.grossSharePrice;
  performanceFeeState.highWaterMark = args.highWaterMark;
  performanceFeeState.aggregateValueDue = args.aggregateValueDue;
  performanceFeeState.save();

  return performanceFeeState;
}

function findPerformanceFeeState(feeStates: string[]): PerformanceFeeState | null {
  for (let i: i32 = 0; i < feeStates.length; i++) {
    let performanceFeeState = PerformanceFeeState.load(feeStates[i]);

    if (performanceFeeState != null) {
      let fee = Fee.load(performanceFeeState.fee);

      if (fee != null && fee.identifier == 'PERFORMANCE') {
        return performanceFeeState;
      }
    }
  }

  return null;
}

export function ensurePerformanceFeeState(
  fund: Fund,
  fee: Fee,
  event: ethereum.Event,
  cause: Entity,
): PerformanceFeeState {
  let performanceFeeState = PerformanceFeeState.load(performanceFeeStateId(fund, event)) as PerformanceFeeState;

  if (!performanceFeeState) {
    let state = useState(stateId(fund, event));
    let previousFeeState = useFeeState(state.feeState);

    let previous = findPerformanceFeeState(previousFeeState.feeStates);
    if (previous) {
      performanceFeeState = createPerformanceFeeState(
        fund,
        fee,
        {
          grossSharePrice: previous.grossSharePrice,
          highWaterMark: previous.highWaterMark,
          aggregateValueDue: previous.aggregateValueDue,
        },
        event,
        cause,
      );

      let fs = previousFeeState.feeStates;
      for (let i: i16 = 0; i < fs.length; i++) {
        log.warning('ZZZZZZZZZZ prev {}', [fs[i]]);
      }

      log.warning('XXXXXXXXXXXX previous {} new {}', [previous.id, performanceFeeState.id]);

      let ids = arrayDiff<string>(fs, [previous.id]);

      for (let i: i16 = 0; i < ids.length; i++) {
        log.warning('BBBBBBBBBBB id {}', [ids[i]]);
      }

      let newIds = arrayUnique<string>(ids.concat([performanceFeeState.id]));

      for (let i: i16 = 0; i < newIds.length; i++) {
        log.warning('AAAAAAAAAAA id {}', [newIds[i]]);
      }

      let feeState = useFeeState(feeStateId(fund, event));
      feeState.feeStates = newIds;
      feeState.save();
    } else {
      performanceFeeState = createPerformanceFeeState(
        fund,
        fee,
        {
          grossSharePrice: BigDecimal.fromString('0'),
          highWaterMark: BigDecimal.fromString('0'),
          aggregateValueDue: BigDecimal.fromString('0'),
        },
        event,
        cause,
      );

      let feeState = useFeeState(feeStateId(fund, event));
      feeState.feeStates = feeState.feeStates.concat([performanceFeeState.id]);
      feeState.save();
    }
  } else {
    let events = performanceFeeState.events;
    performanceFeeState.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    performanceFeeState.save();
  }

  return performanceFeeState;
}

export function usePerformanceFeeState(id: string): PerformanceFeeState {
  let feeState = PerformanceFeeState.load(id) as PerformanceFeeState;
  if (feeState == null) {
    logCritical('Failed to load performance fee state {}.', [id]);
  }

  return feeState;
}
