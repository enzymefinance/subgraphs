import {
  dayCloseTime,
  dayOpenTime,
  hourCloseTime,
  hourOpenTime,
  monthOpenAndClose,
} from '@enzymefinance/subgraph-utils';
import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { DailyVaultState, HourlyVaultState, MonthlyVaultState, Vault, VaultState } from '../generated/schema';

export function periodicFundStateId(vault: Vault, start: BigInt, type: string): string {
  return vault.id + '/' + start.toString() + '/' + type;
}

export function trackHourlyFundState(vault: Vault, fundState: VaultState, event: ethereum.Event): HourlyVaultState {
  let start = hourOpenTime(event.block.timestamp);
  let end = hourCloseTime(event.block.timestamp);

  let id = periodicFundStateId(vault, start, 'hourly');
  let hourlyFundState = HourlyVaultState.load(id) as HourlyVaultState;

  if (!hourlyFundState) {
    hourlyFundState = new HourlyVaultState(id);
    hourlyFundState.vault = vault.id;
    hourlyFundState.start = start;
    hourlyFundState.end = end;
    hourlyFundState.first = fundState.id;
  }

  hourlyFundState.last = fundState.id;
  hourlyFundState.save();

  return hourlyFundState;
}

export function trackDailyFundState(vault: Vault, fundState: VaultState, event: ethereum.Event): DailyVaultState {
  let start = dayOpenTime(event.block.timestamp);
  let end = dayCloseTime(event.block.timestamp);

  let id = periodicFundStateId(vault, start, 'daily');
  let dailyFundState = DailyVaultState.load(id) as DailyVaultState;

  if (!dailyFundState) {
    dailyFundState = new DailyVaultState(id);
    dailyFundState.vault = vault.id;
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

export function trackMonthlyFundState(fund: Vault, fundState: VaultState, event: ethereum.Event): MonthlyVaultState {
  let monthStartAndEnd = monthOpenAndClose(event.block.timestamp);
  let start = monthStartAndEnd[0];
  let end = monthStartAndEnd[1];

  let id = periodicFundStateId(fund, start, 'monthly');
  let monthlyFundState = MonthlyVaultState.load(id) as MonthlyVaultState;

  if (!monthlyFundState) {
    monthlyFundState = new MonthlyVaultState(id);
    monthlyFundState.vault = fund.id;
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
