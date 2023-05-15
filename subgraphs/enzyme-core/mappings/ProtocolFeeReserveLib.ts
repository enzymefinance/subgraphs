import {
  ProtocolFeeReserveLibSet,
  SharesBoughtBack,
  MlnTokenBalanceWithdrawn,
} from '../generated/contracts/ProtocolFeeReserveLibEvents';

export function handleSharesBoughtBack(event: SharesBoughtBack): void {
  // tracked in VaultLib
}

export function handleProtocolFeeReserveLibSet(event: ProtocolFeeReserveLibSet): void {}

export function handleMlnTokenBalanceWithdrawn(event: MlnTokenBalanceWithdrawn): void {}
