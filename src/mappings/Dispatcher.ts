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
import { ensureFundDeployer } from '../entities/FundDeployer';
import { zeroAddress } from '../constants';

export function handleCurrentFundDeployerSet(event: CurrentFundDeployerSet): void {
  if (!event.params.prevFundDeployer.equals(zeroAddress)) {
    let prevFundDeployer = ensureFundDeployer(event.params.prevFundDeployer);
    prevFundDeployer.current = false;
    prevFundDeployer.currentEnd = event.block.timestamp;
    prevFundDeployer.save();
  }

  let nextFundDeployer = ensureFundDeployer(event.params.nextFundDeployer);
  nextFundDeployer.current = true;
  nextFundDeployer.currentStart = event.block.timestamp;
  nextFundDeployer.save();
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
