import { toBigDecimal } from '../../../../utils';
import { ensureNetwork } from '../../entities/Network';
import { createProtocolFee, useProtocolFee } from '../../entities/ProtocolFee';
import {
  FeeBpsDefaultSet,
  FeeBpsOverrideSetForVault,
  FeePaidForVault,
  InitializedForVault,
  LastPaidSetForVault,
} from '../../generated/contracts/ProtocolFeeTracker4Events';
import { ProtocolSdk } from '../../generated/contracts/ProtocolSdk';

export function handleInitializedForVault(event: InitializedForVault): void {
  let protocolFeeTrackerContract = ProtocolSdk.bind(event.address);
  let rate = protocolFeeTrackerContract.getFeeBpsForVault(event.params.vaultProxy);

  let protocolFee = createProtocolFee(event.params.vaultProxy, event.address);
  protocolFee.rate = toBigDecimal(rate, 4);
  protocolFee.save();
}

export function handleFeeBpsDefaultSet(event: FeeBpsDefaultSet): void {
  let network = ensureNetwork(event);
  network.protocolFeeRate = toBigDecimal(event.params.nextFeeBpsDefault, 4);
  network.save();
}

export function handleFeeBpsOverrideSetForVault(event: FeeBpsOverrideSetForVault): void {
  let protocolFee = useProtocolFee(event.params.vaultProxy, event.address);
  protocolFee.rate = toBigDecimal(event.params.nextFeeBpsOverride, 4);
  protocolFee.save();
}

export function handleFeePaidForVault(event: FeePaidForVault): void {
  // tracked in VaultLib
}

export function handleLastPaidSetForVault(event: LastPaidSetForVault): void {
  let protocolFee = useProtocolFee(event.params.vaultProxy, event.address);
  protocolFee.lastPaid = event.params.nextTimestamp.toI32();
  protocolFee.save();
}
