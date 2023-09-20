import {
  ExitRequestAdded,
  ExitRequestRemoved,
  VaultTokenAdded,
  VaultTokenRemoved,
} from '../../generated/contracts/StakeWiseV3StakingPositionLib4Events';

export function handleExitRequestAdded(event: ExitRequestAdded): void {}
export function handleExitRequestRemoved(event: ExitRequestRemoved): void {}
export function handleVaultTokenAdded(event: VaultTokenAdded): void {}
export function handleVaultTokenRemoved(event: VaultTokenRemoved): void {}
