import { arrayUnique, logCritical } from '@enzymefinance/subgraph-utils';
import { BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { Fee, FeeState, Vault } from '../generated/schema';
import { ensureEntranceRateBurnFeeState } from './EntranceRateBurnFeeState';
import { ensureEntranceRateDirectFeeState } from './EntranceRateDirectFeeState';
import { ensureManagementFeeState } from './ManagementFeeState';
import { ensurePerformanceFeeState } from './PerformanceFeeState';
import { ensureVaultState, useVaultState } from './VaultState';

export function feeStateId(fund: Vault, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/feeState';
}

export function createFeeState(
  feeStateIds: string[],
  vault: Vault,
  event: ethereum.Event,
  cause: Entity | null,
): FeeState {
  let feeState = new FeeState(feeStateId(vault, event));
  feeState.timestamp = event.block.timestamp;
  feeState.vault = vault.id;
  feeState.feeStates = feeStateIds;
  feeState.events = cause ? [cause.getString('id')] : new Array<string>();
  feeState.save();

  return feeState;
}

export function ensureFeeState(vault: Vault, event: ethereum.Event, cause: Entity): FeeState {
  let feeState = FeeState.load(feeStateId(vault, event)) as FeeState;

  if (!feeState) {
    let state = useVaultState(vault.state);
    let previous = useFeeState(state.feeState);
    feeState = createFeeState(previous.feeStates, vault, event, cause);
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

export function trackFeeState(
  fund: Vault,
  fee: Fee,
  shares: BigDecimal,
  event: ethereum.Event,
  cause: Entity,
): FeeState {
  let feeState = ensureFeeState(fund, event, cause);

  if (fee.identifier == 'MANAGEMENT') {
    ensureManagementFeeState(fund, fee, shares, event, cause);
  } else if (fee.identifier == 'PERFORMANCE') {
    ensurePerformanceFeeState(fund, fee, event, cause);
  } else if (fee.identifier == 'ENTRANCE_RATE_DIRECT') {
    ensureEntranceRateDirectFeeState(fund, fee, event, cause);
  } else if (fee.identifier == 'ENTRANCE_RATE_BURN') {
    ensureEntranceRateBurnFeeState(fund, fee, event, cause);
  } else {
    return feeState;
  }

  let state = ensureVaultState(fund, event);
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(feeState.events));
  state.feeState = feeState.id;
  state.save();

  fund.feeState = feeState.id;
  fund.save();

  return feeState;
}
