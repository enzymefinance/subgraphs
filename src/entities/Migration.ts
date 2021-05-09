import { MigrationSignaled } from '../generated/DispatcherContract';
import { Migration } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensureComptrollerProxy } from './ComptrollerProxy';
import { useFund } from './Fund';
import { ensureRelease } from './Release';

export function useMigration(id: string): Migration {
  let migration = Migration.load(id) as Migration;
  if (migration == null) {
    logCritical('Failed to load migration {}.', [id]);
  }

  return migration;
}

export function ensureMigration(event: MigrationSignaled): Migration {
  let id = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.params.executableTimestamp.toString(),
  );

  let migration = Migration.load(id) as Migration;
  if (migration) {
    return migration;
  }

  migration = new Migration(id);
  migration.prevRelease = ensureRelease(event.params.prevFundDeployer.toHex(), event).id;
  migration.nextRelease = ensureRelease(event.params.nextFundDeployer.toHex(), event).id;
  migration.fund = useFund(event.params.vaultProxy.toHex()).id;
  migration.executableTimestamp = event.params.executableTimestamp;
  migration.cancelled = false;
  migration.executed = false;
  migration.nextAccessor = ensureComptrollerProxy(event.params.nextVaultAccessor, event).id;
  migration.save();

  return migration;
}

// Uniquely identifies a signaled migration.
export function generateMigrationId(
  vaultProxy: string,
  prevFundDeployer: string,
  nextFundDeployer: string,
  executableTimestamp: string,
): string {
  let arr: Array<string> = [vaultProxy, prevFundDeployer, nextFundDeployer, executableTimestamp];
  return arr.join('/');
}
