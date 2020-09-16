import { Address, BigInt } from '@graphprotocol/graph-ts';
import { MigrationSignaled } from '../generated/DispatcherContract';
import { Migration, Fund, FundDeployer } from '../generated/schema';
import { useFundDeployer } from './FundDeployer';
import { useRelease } from './Release';
import { useFund } from './Fund';
import { ensureVaultLib } from './VaultLib';
import { logCritical } from '../utils/logCritical';

export function useMigration(id: string): Migration {
  let migration = Migration.load(id);
  if (migration == null) {
    logCritical('Failed to load migration {}.', [id]);
  }

  return migration as Migration;
}

export function ensureMigration(event: MigrationSignaled): Migration {
  let id = generateMigrationId(event.params.vaultProxy, event.params.prevFundDeployer, event.params.nextFundDeployer);
  let migration = Migration.load(id);
  if (migration) {
    // Setting canceled as false in case we're re-signaling a previously canceled Migration (that cancelled Migration has the same ID)
    migration.canceled = false;
    return migration;
  }
  migration = new Migration(id);
  migration.prevRelease = useRelease(event.params.prevFundDeployer.toHex()).id;
  migration.nextRelease = useRelease(event.params.nextFundDeployer.toHex()).id;
  migration.fund = useFund(event.params.vaultProxy.toHex()).id;
  migration.signalTimestamp = event.block.timestamp;
  migration.canceled = false;
  migration.executed = false;
  migration.save();
  return migration;
}

/* export function createMigration(event: MigrationSignaled): Migration {
  let id = genericId(event);
  let migration = new Migration(id);

  migration.prevRelease = useRelease(event.params.prevFundDeployer).id;
  migration.nextRelease = useRelease(event.params.nextFundDeployer).id;
  migration.fund = useFund(event.params.vaultProxy);
  migration.signalTimestamp = event.params.signalTimestamp;
  migration.canceled = false;
  migration.executed = false;
  migration.save();

  return migration;
} */

export function generateMigrationId(fund: Address, prevFundDeployer: Address, nextFundDeployer: Address): string {
  // Uniquely identifies a migration. Each fund can only have one migration from X to Y.
  return (
    useFund(fund.toHex()).id +
    '/' +
    useFundDeployer(prevFundDeployer.toHex()).id +
    '/' +
    useFundDeployer(nextFundDeployer.toHex()).id
  );
}
