import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { DailyFundState, Fund, FundState, HourlyFundState } from '../generated/schema';
import { day, getDayOpenTime, getHourOpenTime, hour } from '../utils/timeHelpers';

export function periodicFundStateId(fund: Fund, start: BigInt): string {
  return fund.id + '/' + start.toString();
}

export function trackHourlyFundState(fund: Fund, fundState: FundState, event: ethereum.Event): HourlyFundState {
  let start = getHourOpenTime(event.block.timestamp);
  let end = start.plus(hour);

  let id = periodicFundStateId(fund, start);
  let hourlyFundState = HourlyFundState.load(id) as HourlyFundState;

  if (!hourlyFundState) {
    hourlyFundState = new HourlyFundState(id);
    hourlyFundState.fund = fund.id;
    hourlyFundState.start = start;
    hourlyFundState.end = end;
    hourlyFundState.first = fundState.id;
  }

  hourlyFundState.last = fundState.id;
  hourlyFundState.save();

  return hourlyFundState;
}

export function trackDailyFundState(fund: Fund, fundState: FundState, event: ethereum.Event): DailyFundState {
  let start = getDayOpenTime(event.block.timestamp);
  let end = start.plus(day);

  let id = periodicFundStateId(fund, start);
  let dailyFundState = DailyFundState.load(id) as DailyFundState;

  if (!dailyFundState) {
    dailyFundState = new DailyFundState(id);
    dailyFundState.fund = fund.id;
    dailyFundState.start = start;
    dailyFundState.end = end;
    dailyFundState.first = fundState.id;
    dailyFundState.last = fundState.id;
  } else {
    dailyFundState.last = fundState.id;
  }
  dailyFundState.save();

  return dailyFundState;
}
