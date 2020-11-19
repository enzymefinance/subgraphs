import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { DailyFundState, Fund, FundState, HourlyFundState, MonthlyFundState } from '../generated/schema';
import { day, getDayOpenTime, getHourOpenTime, getMonthStartAndEnd, hour } from '../utils/timeHelpers';

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

export function trackMonthlyFundState(fund: Fund, fundState: FundState, event: ethereum.Event): MonthlyFundState {
  let monthStartAndEnd = getMonthStartAndEnd(event.block.timestamp);
  let start = monthStartAndEnd[0];
  let end = monthStartAndEnd[1];

  let id = periodicFundStateId(fund, start);
  let monthlyFundState = MonthlyFundState.load(id) as MonthlyFundState;

  if (!monthlyFundState) {
    monthlyFundState = new MonthlyFundState(id);
    monthlyFundState.fund = fund.id;
    monthlyFundState.start = start;
    monthlyFundState.end = end;
    monthlyFundState.first = fundState.id;
    monthlyFundState.last = fundState.id;
  } else {
    monthlyFundState.last = fundState.id;
  }
  monthlyFundState.save();

  return monthlyFundState;
}
