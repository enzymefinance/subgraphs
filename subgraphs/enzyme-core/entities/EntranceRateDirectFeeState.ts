import { arrayDiff, arrayUnique, logCritical } from '@enzymefinance/subgraph-utils';
import { BigInt, Entity, ethereum } from '@graphprotocol/graph-ts';
import { EntranceRateDirectFeeState, Fee, Vault } from '../generated/schema';
import { feeStateId, useFeeState } from './FeeState';
import { useVaultState } from './VaultState';

class EntranceRateDirectFeeStateArgs {
  lastSettled: BigInt;
}

export function entranceRateDirectFeeStateId(vault: Vault, event: ethereum.Event): string {
  return vault.id + '/' + event.block.timestamp.toString() + '/feeState/entranceRateDirect';
}

export function createEntranceRateDirectFeeState(
  vault: Vault,
  fee: Fee,
  args: EntranceRateDirectFeeStateArgs,
  event: ethereum.Event,
  cause: Entity,
): EntranceRateDirectFeeState {
  let feeState = new EntranceRateDirectFeeState(entranceRateDirectFeeStateId(vault, event));
  feeState.timestamp = event.block.timestamp;
  feeState.vault = vault.id;
  feeState.fee = fee.id;
  feeState.lastSettled = args.lastSettled;
  feeState.events = [cause.getString('id')];
  feeState.save();

  return feeState;
}

function findEntranceRateDirectFeeState(feeStates: string[]): EntranceRateDirectFeeState | null {
  for (let i: i32 = 0; i < feeStates.length; i++) {
    if (feeStates[i].endsWith('/entranceRateDirect')) {
      return EntranceRateDirectFeeState.load(feeStates[i]);
    }
  }

  return null;
}

export function ensureEntranceRateDirectFeeState(
  vault: Vault,
  fee: Fee,
  event: ethereum.Event,
  cause: Entity,
): EntranceRateDirectFeeState {
  let entranceRateDirectFeeState = EntranceRateDirectFeeState.load(
    entranceRateDirectFeeStateId(vault, event),
  ) as EntranceRateDirectFeeState;

  if (!entranceRateDirectFeeState) {
    let state = useVaultState(vault.state);
    let previousFeeState = useFeeState(state.feeState);

    let previous = findEntranceRateDirectFeeState(previousFeeState.feeStates);
    if (previous) {
      entranceRateDirectFeeState = createEntranceRateDirectFeeState(
        vault,
        fee,
        { lastSettled: previous.lastSettled },
        event,
        cause,
      );

      let ids = arrayDiff<string>(previousFeeState.feeStates, [previous.id]);
      ids = arrayUnique<string>(ids.concat([entranceRateDirectFeeState.id]));

      let feeState = useFeeState(feeStateId(vault, event));
      feeState.feeStates = ids;
      feeState.save();
    } else {
      entranceRateDirectFeeState = createEntranceRateDirectFeeState(
        vault,
        fee,
        { lastSettled: BigInt.fromI32(0) },
        event,
        cause,
      );
      let feeState = useFeeState(feeStateId(vault, event));
      feeState.feeStates = feeState.feeStates.concat([entranceRateDirectFeeState.id]);
      feeState.save();
    }
  } else {
    let events = entranceRateDirectFeeState.events;
    entranceRateDirectFeeState.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    entranceRateDirectFeeState.save();
  }

  return entranceRateDirectFeeState;
}

export function useEntranceRateDirectFeeState(id: string): EntranceRateDirectFeeState {
  let feeState = EntranceRateDirectFeeState.load(id) as EntranceRateDirectFeeState;
  if (feeState == null) {
    logCritical('Failed to load entranceRateDirect fee state {}.', [id]);
  }

  return feeState;
}
