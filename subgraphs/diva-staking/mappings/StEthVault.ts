import { AccessorSet } from '../generated/contracts/StEthVaultEvents';
import * as vaultHandlers from '../utils/vaultHandlers';

export function handleAccessorSet(event: AccessorSet): void {
  vaultHandlers.handleAccessorSet(event.params.nextAccessor, event.address);
}
