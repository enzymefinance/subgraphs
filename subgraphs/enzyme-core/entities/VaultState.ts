import { ethereum } from '@graphprotocol/graph-ts';
import { logCritical } from '../../../utils/utils/logging';
import { CalculationState, FeeState, PortfolioState, ShareState, Vault, VaultState } from '../generated/schema';
import { useCalculationState } from './CalculationState';
import { ensureCurrencyPrice } from './CurrencyPrice';
import { useFeeState } from './FeeState';
import { trackDailyFundState, trackHourlyFundState, trackMonthlyFundState } from './PeriodicFundState';
import { usePortfolioState } from './PortfolioState';
import { useShareState } from './ShareState';

export function vaultStateId(fund: Vault, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString();
}

export function createVaultState(
  shares: ShareState,
  portfolio: PortfolioState,
  feeState: FeeState,
  calculations: CalculationState,
  investmentCount: number,
  vault: Vault,
  event: ethereum.Event,
): VaultState {
  let state = new VaultState(vaultStateId(vault, event));
  state.timestamp = event.block.timestamp;
  state.vault = vault.id;
  state.shares = shares.id;
  state.portfolio = portfolio.id;
  state.feeState = feeState.id;
  state.calculations = calculations.id;
  state.events = new Array<string>();
  state.investmentCount = investmentCount as i32;
  state.currency = ensureCurrencyPrice(event).id;
  state.save();

  return state;
}

export function ensureVaultState(vault: Vault, event: ethereum.Event): VaultState {
  let current = VaultState.load(vaultStateId(vault, event)) as VaultState;
  if (current) {
    return current;
  }

  let previous = useVaultState(vault.state);
  let shares = useShareState(previous.shares);
  let holdings = usePortfolioState(previous.portfolio);
  let feeState = useFeeState(previous.feeState);
  let calculations = useCalculationState(previous.calculations);
  let investmentCount = previous.investmentCount;
  let state = createVaultState(shares, holdings, feeState, calculations, investmentCount, vault, event);

  vault.state = state.id;
  vault.save();

  // link fund states to period states
  trackHourlyFundState(vault, state, event);
  trackDailyFundState(vault, state, event);
  trackMonthlyFundState(vault, state, event);

  return state;
}

export function useVaultState(id: string): VaultState {
  let state = VaultState.load(id) as VaultState;
  if (state == null) {
    logCritical('Failed to load fund aggregated state {}.', [id]);
  }

  return state;
}
