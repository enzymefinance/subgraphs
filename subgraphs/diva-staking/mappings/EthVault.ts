import { createComptroller } from '../entities/ComptrollerProxy';
import { AccessorSet } from '../generated/contracts/VaultETHEvents';

export function handleAccessorSet(event: AccessorSet): void {
  createComptroller(event.params.nextAccessor, event.address);
}
