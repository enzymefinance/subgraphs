import { Address, BigInt } from '@graphprotocol/graph-ts';
import { MigrationCancelled, MigrationSignaled } from '../generated/DispatcherContract';
import { Migration, Fund, FundDeployer } from '../generated/schema';
import { useFundDeployer } from './FundDeployer';
import { useRelease } from './Release';
import { useFund } from './Fund';
import { ensureComptroller } from './Comptroller';
import { logCritical } from '../utils/logCritical';

export function useMigration(id: string): Migration {
  let migration = Migration.load(id);
  if (migration == null) {
    logCritical('Failed to load migration {}.', [id]);
  }

  return migration as Migration;
}

export function ensureMigration(event: MigrationSignaled): Migration {
  let id = generateMigrationId(event);
  let migration = Migration.load(id);
  if (migration) {
    // Setting cancelled as false in case we're re-signaling a previously cancelled Migration (that cancelled Migration has the same ID)
    migration.cancelled = false;
    return migration as Migration;
  }
  migration = new Migration(id);
  migration.prevRelease = useRelease(event.params.prevFundDeployer.toHex()).id;
  migration.nextRelease = useRelease(event.params.nextFundDeployer.toHex()).id;
  migration.fund = useFund(event.params.vaultProxy.toHex()).id;
  migration.signalTimestamp = event.block.timestamp;
  migration.cancelled = false;
  migration.executed = false;
  // nextAccessor gets assigned to fund on migration execution
  migration.nextAccessor = ensureComptroller(event.params.nextVaultAccessor).id;
  migration.save();
  return migration as Migration;
}

export function generateMigrationId(event: MigrationSignaled): string {
  // Uniquely identifies a migration. Each fund can only have one migration from X to Y.
  return (
    event.params.vaultProxy.toHex() +
    '/' +
    event.params.prevFundDeployer.toHex() +
    '/' +
    event.params.nextFundDeployer.toHex()
  );
}
