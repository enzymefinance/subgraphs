import { ethereum, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { TrancheAmount } from '../generated/schema';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { getAccruedRewardsForTrancheAmount } from '../utils/rewards';
import { tranchesConfig } from '../utils/tranches';

export function createTrancheAmount(
  trancheId: i32,
  amount: BigDecimal,
  startStakingAt: i32,
  endStakingAt: i32,
  event: ethereum.Event,
): TrancheAmount {
  let trancheAmount = new TrancheAmount(uniqueEventId(event));

  let accruedRewards = getAccruedRewardsForTrancheAmount(
    amount,
    tranchesConfig[trancheId].divaPerEthPerDay,
    BigInt.fromI32(startStakingAt),
    BigInt.fromI32(endStakingAt),
  );

  trancheAmount.trancheId = trancheId;
  trancheAmount.amount = amount;
  trancheAmount.startStakingAt = startStakingAt;
  trancheAmount.endStakingAt = endStakingAt;
  trancheAmount.firstPhaseAccruedRewards = accruedRewards.firstPhaseAccruedRewards;
  trancheAmount.secondPhaseAccruedRewards = accruedRewards.secondPhaseAccruedRewards;
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
