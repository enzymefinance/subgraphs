import { zeroAddress } from '../constants';
import { ensureContract } from '../entities/Contract';
import { ensureFundDeployer } from '../entities/FundDeployer';
import { ensureTransaction } from '../entities/Transaction';
import {
  CurrentFundDeployerSet,
  MigrationCancelled,
  MigrationExecuted,
  MigrationSignaled,
  PostCancelMigrationOriginHookFailed,
  PostCancelMigrationTargetHookFailed,
  PostMigrateOriginHookFailed,
  PostSignalMigrationOriginHookFailed,
  PreMigrateOriginHookFailed,
  PreSignalMigrationOriginHookFailed,
  VaultProxyDeployed,
} from '../generated/DispatcherContract';
import { FundDeployerSetEvent } from '../generated/schema';
import { genericId } from '../utils/genericId';

export function handleCurrentFundDeployerSet(event: CurrentFundDeployerSet): void {
  let fundDeployerSet = new FundDeployerSetEvent(genericId(event));

  if (!event.params.prevFundDeployer.equals(zeroAddress)) {
    let prevFundDeployer = ensureFundDeployer(event.params.prevFundDeployer);
    prevFundDeployer.current = false;
    prevFundDeployer.currentEnd = event.block.timestamp;
    prevFundDeployer.save();

    fundDeployerSet.prevFundDeployer = prevFundDeployer.id;
  }

  let nextFundDeployer = ensureFundDeployer(event.params.nextFundDeployer);
  nextFundDeployer.current = true;
  nextFundDeployer.currentStart = event.block.timestamp;
  nextFundDeployer.save();

  fundDeployerSet.contract = ensureContract(event.address, 'Dispatcher', event.block.timestamp).id;
  fundDeployerSet.timestamp = event.block.timestamp;
  fundDeployerSet.nextFundDeployer = nextFundDeployer.id;
  fundDeployerSet.transaction = ensureTransaction(event).id;
  fundDeployerSet.save();
}

export function handleMigrationCancelled(event: MigrationCancelled): void {}
export function handleMigrationExecuted(event: MigrationExecuted): void {}
export function handleMigrationSignaled(event: MigrationSignaled): void {}
export function handlePostCancelMigrationOriginHookFailed(event: PostCancelMigrationOriginHookFailed): void {}
export function handlePostCancelMigrationTargetHookFailed(event: PostCancelMigrationTargetHookFailed): void {}
export function handlePostMigrateOriginHookFailed(event: PostMigrateOriginHookFailed): void {}
export function handlePostSignalMigrationOriginHookFailed(event: PostSignalMigrationOriginHookFailed): void {}
export function handlePreMigrateOriginHookFailed(event: PreMigrateOriginHookFailed): void {}
export function handlePreSignalMigrationOriginHookFailed(event: PreSignalMigrationOriginHookFailed): void {}
export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {}
