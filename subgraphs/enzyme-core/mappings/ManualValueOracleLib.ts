import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureManualValueOracle } from '../entities/ManualValueOracle';
import {
  Initialized,
  NominatedOwnerSet,
  OwnerSet,
  UpdaterSet,
  ValueUpdated,
} from '../generated/contracts/ManualValueOracleLibEvents';
import { ManualValueOracleValueChange } from '../generated/schema';

export function handleInitialized(event: Initialized): void {
  let oracle = ensureManualValueOracle(event.address, event);
  oracle.description = event.params.description;
  oracle.save();
}

export function handleOwnerSet(event: OwnerSet): void {
  let oracle = ensureManualValueOracle(event.address, event);
  oracle.owner = event.params.owner;
  oracle.save();
}

export function handleUpdaterSet(event: UpdaterSet): void {
  let oracle = ensureManualValueOracle(event.address, event);
  oracle.updater = event.params.updater;
  oracle.save();
}

export function handleValueUpdated(event: ValueUpdated): void {
  let oracle = ensureManualValueOracle(event.address, event);
  oracle.value = event.params.value;
  oracle.save();

  let valueChange = new ManualValueOracleValueChange(uniqueEventId(event));
  valueChange.value = event.params.value;
  valueChange.timestamp = event.block.timestamp.toI32();
  valueChange.oracle = oracle.id;
  valueChange.save();
}

export function handleNominatedOwnerSet(event: NominatedOwnerSet): void {
  let oracle = ensureManualValueOracle(event.address, event);
  oracle.nominatedOwner = event.params.nominatedOwner;
  oracle.save();
}
