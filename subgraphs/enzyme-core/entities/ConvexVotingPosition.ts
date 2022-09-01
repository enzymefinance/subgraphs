import { arrayUnique, logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum, BigInt } from '@graphprotocol/graph-ts';
import {
  ConvexVotingPosition,
  ConvexVotingPositionChange,
  Vault,
  AssetAmount,
  ExternalPositionType,
  Asset,
} from '../generated/schema';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';
import { ExternalSdk } from '../generated/contracts/ExternalSdk';
import { cvxLockerV2Address } from '../generated/addresses';
import { ensureConvexVotingLock, useConvexVotingLock } from './ConvexVotingLock';

export function useConvexVotingPosition(id: string): ConvexVotingPosition {
  let convexVotingPosition = ConvexVotingPosition.load(id);
  if (convexVotingPosition == null) {
    logCritical('Failed to load ConvexVotingPosition {}.', [id]);
  }

  return convexVotingPosition as ConvexVotingPosition;
}

export function createConvexVotingPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): ConvexVotingPosition {
  let convexVotingPosition = new ConvexVotingPosition(externalPositionAddress.toHex());
  convexVotingPosition.vault = useVault(vaultAddress.toHex()).id;
  convexVotingPosition.active = true;
  convexVotingPosition.lastWithdrawOrRelockTimestamp = 0;
  convexVotingPosition.type = type.id;
  convexVotingPosition.claimedVotiumMerkleProofsHashes = new Array<string>();
  convexVotingPosition.locks = new Array<string>();
  convexVotingPosition.save();

  return convexVotingPosition;
}

export function createConvexVotingPositionChange(
  convexVotingPositionAddress: Address,
  assetAmounts: AssetAmount[] | null,
  assets: Asset[] | null,
  delegate: Address | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): ConvexVotingPositionChange {
  let change = new ConvexVotingPositionChange(uniqueEventId(event));
  change.convexVotingPositionChangeType = changeType;
  change.externalPosition = convexVotingPositionAddress.toHex();
  change.assetAmounts = assetAmounts != null ? assetAmounts.map<string>((assetAmount) => assetAmount.id) : null;
  change.assets = assets != null ? assets.map<string>((asset) => asset.id) : null;
  change.delegate = delegate;
  change.vault = vault.id;
  change.timestamp = event.block.timestamp.toI32();
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';

  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}

export function updateConvexVotingPositionWithdrawOrRelock(
  externalPositionAddress: Address,
  event: ethereum.Event,
): ConvexVotingPosition {
  let convexVotingPosition = useConvexVotingPosition(externalPositionAddress.toHex());
  convexVotingPosition.lastWithdrawOrRelockTimestamp = event.block.timestamp.toI32();
  convexVotingPosition.save();

  for (let i: i32 = 0; i < convexVotingPosition.locks.length; i++) {
    let lock = useConvexVotingLock(convexVotingPosition.locks[i]);
    lock.withdrawn = true;
    lock.save();
  }

  return convexVotingPosition;
}

export function updateConvexVotingPositionUserLocks(externalPositionAddress: Address): ConvexVotingPosition {
  let convexVotingPosition = useConvexVotingPosition(externalPositionAddress.toHex());
  let votingLocks = convexVotingPosition.locks;

  let cvxLockerV2Contract = ExternalSdk.bind(cvxLockerV2Address);

  let reverted = false;
  let counter: i32 = 0;

  while (reverted == false) {
    let lockCall = cvxLockerV2Contract.try_userLocks(externalPositionAddress, BigInt.fromI32(counter));

    if (lockCall.reverted) {
      reverted = true;
    } else {
      let lock = ensureConvexVotingLock(externalPositionAddress, BigInt.fromI32(counter));

      lock.amount = toBigDecimal(lockCall.value.value0);
      lock.unlockTime = lockCall.value.value2.toI32();
      lock.withdrawn = convexVotingPosition.lastWithdrawOrRelockTimestamp > lockCall.value.value2.toI32();

      lock.save();

      votingLocks = arrayUnique<string>(votingLocks.concat([lock.id]));
    }
    counter = counter + 1;
  }

  convexVotingPosition.locks = votingLocks;
  convexVotingPosition.save();

  return convexVotingPosition;
}
