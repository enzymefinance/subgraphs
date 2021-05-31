import { ethereum } from '@graphprotocol/graph-ts';
import { FeeState, Fund, FundState, PortfolioState, ShareState } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { loadCurrentCurrencyPrices } from './CurrencyPrice';
import { useFeeState } from './FeeState';
import { trackDailyFundState, trackHourlyFundState, trackMonthlyFundState } from './PeriodicFundState';
import { usePortfolioState } from './PortfolioState';
import { useShareState } from './ShareState';

export function fundStateId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString();
}

export function createFundState(
  shares: ShareState,
  portfolio: PortfolioState,
  feeState: FeeState,
  investmentCount: number,
  fund: Fund,
  event: ethereum.Event,
): FundState {
  let state = new FundState(fundStateId(fund, event));
  state.timestamp = event.block.timestamp;
  state.fund = fund.id;
  state.shares = shares.id;
  state.portfolio = portfolio.id;
  state.feeState = feeState.id;
  state.events = new Array<string>();
  state.investmentCount = investmentCount as i32;
  state.currencyPrices = loadCurrentCurrencyPrices().map<string>((price) => price.id);
  state.save();

  return state;
}

export function ensureFundState(fund: Fund, event: ethereum.Event): FundState {
  let current = FundState.load(fundStateId(fund, event)) as FundState;
  if (current) {
    return current;
  }

  let previous = useFundState(fund.state);
  let shares = useShareState(previous.shares);
  let holdings = usePortfolioState(previous.portfolio);
  let feeState = useFeeState(previous.feeState);
  let investmentCount = previous.investmentCount;
  let state = createFundState(shares, holdings, feeState, investmentCount, fund, event);

  fund.state = state.id;
  fund.save();

  // link fund states to period states
  trackHourlyFundState(fund, state, event);
  trackDailyFundState(fund, state, event);
  trackMonthlyFundState(fund, state, event);

  return state;
}

export function useFundState(id: string): FundState {
  let state = FundState.load(id) as FundState;
  if (state == null) {
    logCritical('Failed to load fund aggregated state {}.', [id]);
  }

  return state;
}
