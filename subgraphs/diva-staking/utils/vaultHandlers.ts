import { createComptroller } from '../entities/Comptroller';

import { AccessorSet as EthVaultAccessorSet } from '../generated/contracts/EthVaultEvents';
import { AccessorSet as StEthVaultEventsAccessorSet } from '../generated/contracts/StEthVaultEvents';
import { ComptrollerLibDataSource } from '../generated/templates';

export function handleAccessorSet(event: EthVaultAccessorSet | StEthVaultEventsAccessorSet): void {
  createComptroller(event.params.nextAccessor, event.address);
  ComptrollerLibDataSource.create(event.params.nextAccessor);
}
