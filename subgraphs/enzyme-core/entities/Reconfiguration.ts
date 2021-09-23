import { logCritical } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import { Reconfiguration } from '../generated/schema';

export function useReconfiguraton(id: string): Reconfiguration {
  let reconfiguration = Reconfiguration.load(id);
  if (reconfiguration == null) {
    logCritical('Failed to load reconfiguration {}.', [id]);
  }

  return reconfiguration as Reconfiguration;
}

// Uniquely identifies a signaled reconfiguration.
export function generateReconfigurationId(vaultProxy: Address, fundDeployer: Address, comptroller: Address): string {
  let arr: Array<string> = [vaultProxy.toHex(), fundDeployer.toHex(), comptroller.toHex()];
  return arr.join('/');
}
