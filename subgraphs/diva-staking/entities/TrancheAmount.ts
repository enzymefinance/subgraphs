import { ethereum, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { TrancheAmount } from '../generated/schema';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { getRewardsForTrancheAmount } from '../utils/rewards';
import { tranchesConfig } from '../utils/constants';

export function createTrancheAmount(
  trancheId: i32,
  amount: BigDecimal,
  startStakingAt: i32,
  endStakingAt: i32,
  suffix: string,
  event: ethereum.Event,
): TrancheAmount {
  let trancheAmountId = uniqueEventId(event, suffix + '/' + trancheId.toString());

  // This shouldn't happen - but if it does we want to know (and then we have to change the id function)
  let potentiallyExistingTrancheAmount = TrancheAmount.load(trancheAmountId);
  if (potentiallyExistingTrancheAmount != null) {
    logCritical('TrancheAmount with id {} already exists!', [trancheAmountId]);
  }

  let trancheAmount = new TrancheAmount(trancheAmountId);

  let rewards = getRewardsForTrancheAmount(
    amount,
    tranchesConfig[trancheId].divaPerEthPerDay,
    BigInt.fromI32(startStakingAt),
    BigInt.fromI32(endStakingAt),
  );

  trancheAmount.createdAt = event.block.timestamp.toI32();
  trancheAmount.updatedAt = trancheAmount.createdAt;
  trancheAmount.trancheId = trancheId;
  trancheAmount.amount = amount;
  trancheAmount.startStakingAt = startStakingAt;
  trancheAmount.endStakingAt = endStakingAt;
  trancheAmount.firstPhaseRewards = rewards.firstPhaseRewards;
  trancheAmount.secondPhaseRewards = rewards.secondPhaseRewards;
  trancheAmount.totalRewards = rewards.totalRewards;
  trancheAmount.save();

  return trancheAmount;
}

export function useTrancheAmount(id: string): TrancheAmount {
  let trancheAmount = TrancheAmount.load(id);

  if (trancheAmount == null) {
    logCritical('Unable to load trancheAmount {}', [id]);
  }

  return trancheAmount as TrancheAmount;
}

export function updateTrancheAmount(id: string, updatedAmount: BigDecimal, timestamp: i32): TrancheAmount {
  let trancheAmount = useTrancheAmount(id);

  let accruedRewards = getRewardsForTrancheAmount(
    updatedAmount,
    tranchesConfig[trancheAmount.trancheId].divaPerEthPerDay,
    BigInt.fromI32(trancheAmount.startStakingAt),
    BigInt.fromI32(trancheAmount.endStakingAt),
  );

  trancheAmount.updatedAt = timestamp;
  trancheAmount.amount = updatedAmount;
  trancheAmount.firstPhaseRewards = accruedRewards.firstPhaseRewards;
  trancheAmount.secondPhaseRewards = accruedRewards.secondPhaseRewards;
  trancheAmount.totalRewards = accruedRewards.totalRewards;
  trancheAmount.save();

  return trancheAmount;
}
