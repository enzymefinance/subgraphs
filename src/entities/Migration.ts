import { MigrationSignaled } from '../generated/DispatcherContract';
import { Migration, Fund, FundDeployer } from '../generated/schema';
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
  let id = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.block.timestamp.toString(),
  );
  let migration = Migration.load(id);
  if (migration) {
    return migration as Migration;
  }
  migration = new Migration(id);
  migration.prevRelease = useRelease(event.params.prevFundDeployer.toHex()).id;
  migration.nextRelease = useRelease(event.params.nextFundDeployer.toHex()).id;
  migration.fund = useFund(event.params.vaultProxy.toHex()).id;
  migration.signalTimestamp = event.block.timestamp;
  migration.cancelled = false;
  migration.executed = false;
  migration.nextAccessor = ensureComptroller(event.params.nextVaultAccessor).id;
  migration.save();
  return migration as Migration;
}

// Uniquely identifies a signaled migration.
export function generateMigrationId(
  vaultProxy: string,
  prevFundDeployer: string,
  nextFundDeployer: string,
  timestamp: string,
): string {
  let arr: string[] = [vaultProxy, prevFundDeployer, nextFundDeployer, timestamp];
  return arr.join('/');
}
