import { AccessorSet } from '../generated/contracts/EthVaultEvents';
import * as vaultHandlers from '../utils/vaultHandlers';

export function handleAccessorSet(event: AccessorSet): void {
  vaultHandlers.handleAccessorSet(event);
}
