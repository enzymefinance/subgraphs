import { createComptroller } from '../entities/Comptroller';
import { AccessorSet } from '../generated/contracts/StEthVaultEvents';
import { ComptrollerLibDataSource } from '../generated/templates';

export function handleAccessorSet(event: AccessorSet): void {
  createComptroller(event.params.nextAccessor, event.address);
  ComptrollerLibDataSource.create(event.params.nextAccessor);
}
