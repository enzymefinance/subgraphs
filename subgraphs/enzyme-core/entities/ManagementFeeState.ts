import { arrayDiff, arrayUnique, logCritical } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt, Entity, ethereum } from '@graphprotocol/graph-ts';
import { ManagementFeeContract } from '../generated/ManagementFeeContract';
import { Fee, ManagementFeeState, Vault } from '../generated/schema';
import { feeStateId, useFeeState } from './FeeState';
import { useVaultState } from './VaultState';

class ManagementFeeStateArgs {
  lastSettled: BigInt;
  shares: BigDecimal;
}

export function managementFeeStateId(vault: Vault, event: ethereum.Event): string {
  return vault.id + '/' + event.block.timestamp.toString() + '/feeState/management';
}

export function createManagementFeeState(
  vault: Vault,
  fee: Fee,
  args: ManagementFeeStateArgs,
  event: ethereum.Event,
  cause: Entity,
): ManagementFeeState {
  let feeState = new ManagementFeeState(managementFeeStateId(vault, event));
  feeState.timestamp = event.block.timestamp;
  feeState.vault = vault.id;
  feeState.fee = fee.id;
  feeState.lastSettled = args.lastSettled;
  feeState.totalSharesPaidOut = args.shares;
  feeState.events = [cause.getString('id')];
  feeState.save();

  return feeState;
}

function findManagementFeeState(feeStates: string[]): ManagementFeeState | null {
  for (let i: i32 = 0; i < feeStates.length; i++) {
    if (feeStates[i].endsWith('/management')) {
      return ManagementFeeState.load(feeStates[i]);
    }
  }

  return null;
}

export function ensureManagementFeeState(
  vault: Vault,
  fee: Fee,
  shares: BigDecimal,
  event: ethereum.Event,
  cause: Entity,
): ManagementFeeState {
  let managementFeeState = ManagementFeeState.load(managementFeeStateId(vault, event)) as ManagementFeeState;

  if (!managementFeeState) {
    let state = useVaultState(vault.state);
    let previousFeeState = useFeeState(state.feeState);

    let previous = findManagementFeeState(previousFeeState.feeStates);
    if (previous) {
      managementFeeState = createManagementFeeState(
        vault,
        fee,
        { lastSettled: previous.lastSettled, shares: previous.totalSharesPaidOut.plus(shares) },
        event,
        cause,
      );

      let ids = arrayDiff<string>(previousFeeState.feeStates, [previous.id]);
      ids = arrayUnique<string>(ids.concat([managementFeeState.id]));

      let feeState = useFeeState(feeStateId(vault, event));
      feeState.feeStates = ids;
      feeState.save();
    } else {
      let contract = ManagementFeeContract.bind(Address.fromString(fee.id));
      let feeInfoCall = contract.try_getFeeInfoForFund(Address.fromString(vault.accessor));
      if (feeInfoCall.reverted) {
        logCritical('getFeeInfoForFund() reverted for {}', [vault.accessor]);
      }

      managementFeeState = createManagementFeeState(
        vault,
        fee,
        { lastSettled: feeInfoCall.value.lastSettled, shares: shares },
        event,
        cause,
      );

      let feeState = useFeeState(feeStateId(vault, event));
      feeState.feeStates = feeState.feeStates.concat([managementFeeState.id]);
      feeState.save();
    }
  } else {
    let events = managementFeeState.events;
    managementFeeState.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    managementFeeState.save();
  }

  return managementFeeState;
}

export function useManagementFeeState(id: string): ManagementFeeState {
  let feeState = ManagementFeeState.load(id) as ManagementFeeState;
  if (feeState == null) {
    logCritical('Failed to load management fee state {}.', [id]);
  }

  return feeState;
}
