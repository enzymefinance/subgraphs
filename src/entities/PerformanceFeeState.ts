import { Address, BigDecimal, BigInt, Entity, ethereum } from '@graphprotocol/graph-ts';
import { PerformanceFeeContract } from '../generated/PerformanceFeeContract';
import { Fee, Fund, PerformanceFeeState } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import { ensureAsset } from './Asset';
import { ensureComptrollerProxy } from './ComptrollerProxy';
import { feeStateId, useFeeState } from './FeeState';
import { useFundState } from './FundState';

class PerformanceFeeStateArgs {
  grossSharePrice: BigDecimal;
  highWaterMark: BigDecimal;
  aggregateValueDue: BigDecimal;
  sharesOutstanding: BigDecimal;
  lastPaid: BigInt;
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
  performanceFeeState.sharesOutstanding = args.sharesOutstanding;
  performanceFeeState.lastPaid = args.lastPaid;
  performanceFeeState.save();

  return performanceFeeState;
}

function findPerformanceFeeState(feeStates: string[]): PerformanceFeeState | null {
  for (let i: i32 = 0; i < feeStates.length; i++) {
    if (feeStates[i].endsWith('/performance')) {
      return PerformanceFeeState.load(feeStates[i]);
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
  let comptrollerProxy = ensureComptrollerProxy(Address.fromString(fund.accessor), event);
  let denominationAsset = ensureAsset(Address.fromString(comptrollerProxy.denominationAsset));

  if (!performanceFeeState) {
    let state = useFundState(fund.state);
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
          sharesOutstanding: previous.sharesOutstanding,
          lastPaid: previous.lastPaid,
        },
        event,
        cause,
      );

      let ids = arrayDiff<string>(previousFeeState.feeStates, [previous.id]);
      ids = arrayUnique<string>(ids.concat([performanceFeeState.id]));

      let feeState = useFeeState(feeStateId(fund, event));
      feeState.feeStates = ids;
      feeState.save();
    } else {
      let contract = PerformanceFeeContract.bind(Address.fromString(fee.id));
      let feeInfoCall = contract.try_getFeeInfoForFund(Address.fromString(fund.accessor));
      if (feeInfoCall.reverted) {
        logCritical('getFeeInfoForFund() reverted for {}', [fund.accessor]);
      }

      performanceFeeState = createPerformanceFeeState(
        fund,
        fee,
        {
          grossSharePrice: toBigDecimal(feeInfoCall.value.lastSharePrice, denominationAsset.decimals),
          highWaterMark: toBigDecimal(feeInfoCall.value.highWaterMark, denominationAsset.decimals),
          aggregateValueDue: toBigDecimal(feeInfoCall.value.aggregateValueDue, denominationAsset.decimals),
          sharesOutstanding: BigDecimal.fromString('0'),
          lastPaid: feeInfoCall.value.lastPaid,
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
