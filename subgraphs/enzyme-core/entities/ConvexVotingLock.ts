import { logCritical, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ConvexVotingLock } from '../generated/schema';

export function ensureConvexVotingLock(externalPositionAddress: Address, lockId: BigInt): ConvexVotingLock {
  let id = externalPositionAddress.toHex() + '/' + lockId.toString();
  let lock = ConvexVotingLock.load(id);

  if (lock) {
    return lock;
  }

  lock = new ConvexVotingLock(id);

  lock.amount = ZERO_BD;
  lock.unlockTime = 0;
  lock.withdrawn = false;

  lock.save();

  return lock;
}

export function useConvexVotingLock(id: string): ConvexVotingLock {
  let convexVotingLock = ConvexVotingLock.load(id);
  if (convexVotingLock == null) {
    logCritical('Failed to load convex voting lock {}.', [id]);
  }

  return convexVotingLock as ConvexVotingLock;
}
