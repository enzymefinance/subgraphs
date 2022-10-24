import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
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
  convexVotingPosition.type = type.id;
  convexVotingPosition.claimedVotiumMerkleProofsHashes = new Array<string>();
  convexVotingPosition.locksCounter = 0;
  convexVotingPosition.lastWithdrawOrRelockTimestamp = 0;
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

  updateConvexVotingPositionUserLocks(externalPositionAddress);

  return convexVotingPosition;
}

export function updateConvexVotingPositionUserLocks(externalPositionAddress: Address): ConvexVotingPosition {
  let convexVotingPosition = useConvexVotingPosition(externalPositionAddress.toHex());

  let cvxLockerV2Contract = ExternalSdk.bind(cvxLockerV2Address);

  let reverted = false;
  let locksCounter: i32 = 0;

  while (reverted == false) {
    let lockCall = cvxLockerV2Contract.try_userLocks(externalPositionAddress, BigInt.fromI32(locksCounter));

    if (lockCall.reverted) {
      reverted = true;
    } else {
      locksCounter = locksCounter + 1;
    }
  }

  convexVotingPosition.locksCounter = locksCounter;
  convexVotingPosition.save();

  return convexVotingPosition;
}
