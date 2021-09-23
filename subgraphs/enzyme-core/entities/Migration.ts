import { logCritical } from '@enzymefinance/subgraph-utils';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Migration } from '../generated/schema';

export function useMigration(id: string): Migration {
  let migration = Migration.load(id);
  if (migration == null) {
    logCritical('Failed to load migration {}.', [id]);
  }

  return migration as Migration;
}

// Uniquely identifies a signaled migration.
export function generateMigrationId(
  vaultProxy: Address,
  prevFundDeployer: Address,
  nextFundDeployer: Address,
  executableTimestamp: BigInt,
): string {
  let arr: Array<string> = [
    vaultProxy.toHex(),
    prevFundDeployer.toHex(),
    nextFundDeployer.toHex(),
    executableTimestamp.toString(),
  ];
  return arr.join('/');
}
