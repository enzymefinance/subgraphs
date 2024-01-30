import { ONE_DAY, logCritical } from '@enzymefinance/subgraph-utils';
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import {
  cooldownDays,
  cooldownEndTimestamp,
  mainnetLaunchTimestamp,
  stakingEndTimestamp,
  stakingPeriodDays,
  stakingStartBeforeLaunchDays,
  stakingStartTimestamp,
} from './constants';

class DaysStaked {
  firstPhaseStakingDays: i32;
  secondPhaseStakingDays: i32;

  constructor(firstPhaseStakingDays: i32, secondPhaseStakingDays: i32) {
    this.firstPhaseStakingDays = firstPhaseStakingDays;
    this.secondPhaseStakingDays = secondPhaseStakingDays;

    if (this.firstPhaseStakingDays > stakingStartBeforeLaunchDays + cooldownDays) {
      logCritical('Invalid firstPhaseStakingDays', []);
    }

    if (this.secondPhaseStakingDays > stakingPeriodDays - stakingStartBeforeLaunchDays) {
      logCritical('Invalid secondPhaseStakingDays');
    }
  }
}

class Rewards {
  firstPhaseRewards: BigDecimal;
  secondPhaseRewards: BigDecimal;
  totalRewards: BigDecimal;

  constructor(firstPhaseRewards: BigDecimal, secondPhaseRewards: BigDecimal, totalRewards: BigDecimal) {
    this.firstPhaseRewards = firstPhaseRewards;
    this.secondPhaseRewards = secondPhaseRewards;
    this.totalRewards = totalRewards;
  }
}

function secondsToFullDays(seconds: BigInt): i32 {
  return seconds.div(ONE_DAY).toI32();
}

function calculateFullStakingDays(depositCreatedAt: BigInt, redemptionTimestamp: BigInt): DaysStaked {
  // Calculate full staking days for a given redemption timestamp

  // Earliest possible staking time is stakingStartTimestamp
  const normalizedStartStakingTimestamp =
    depositCreatedAt < stakingStartTimestamp ? stakingStartTimestamp : depositCreatedAt;

  // Latest possible redemption time is stakingEndTimestamp
  const normalizedEndStakingTimestamp =
    redemptionTimestamp > stakingEndTimestamp ? stakingEndTimestamp : redemptionTimestamp;

  if (normalizedEndStakingTimestamp < mainnetLaunchTimestamp) {
    // Redemption happens before mainnet launch
    // -> no rewards whatsoever
    return new DaysStaked(0, 0);
  }

  if (normalizedEndStakingTimestamp < cooldownEndTimestamp) {
    // Redemption happens after mainnet launch but before cooldown period ended
    // -> rewards only for first phase
    return new DaysStaked(secondsToFullDays(normalizedEndStakingTimestamp.minus(normalizedStartStakingTimestamp)), 0);
  }

  if (normalizedStartStakingTimestamp <= cooldownEndTimestamp) {
    // Staking happened before cooldown period ended
    // Redemption happened after cooldown period ended
    // -> rewards for first and second phase
    return new DaysStaked(
      secondsToFullDays(cooldownEndTimestamp.minus(normalizedStartStakingTimestamp)),
      secondsToFullDays(normalizedEndStakingTimestamp.minus(cooldownEndTimestamp)),
    );
  }

  if (normalizedStartStakingTimestamp < stakingEndTimestamp) {
    // Staking happened after cooldown period ended
    // Redemption happened after cooldown period and before staking ended
    // -> rewards only for second phase
    return new DaysStaked(0, secondsToFullDays(normalizedEndStakingTimestamp.minus(normalizedStartStakingTimestamp)));
  }

  // Staking happened after cooldown period ended
  // Redemption happened after stake period ended
  // -> rewards only for second claim
  return new DaysStaked(0, secondsToFullDays(stakingEndTimestamp.minus(normalizedStartStakingTimestamp)));
}

export function getRewardsForTrancheAmount(
  stakedEthAmount: BigDecimal,
  divaTokensPerEthPerDay: BigDecimal,
  startStakingAt: i32,
  endStakingAt: i32,
): Rewards {
  const fullStakingDays = calculateFullStakingDays(BigInt.fromI32(startStakingAt), BigInt.fromI32(endStakingAt));

  const halfOfFirstClaimAmount = stakedEthAmount
    .times(divaTokensPerEthPerDay)
    .times(BigInt.fromI32(fullStakingDays.firstPhaseStakingDays).toBigDecimal())
    .div(BigDecimal.fromString('2'))
    .truncate(18);

  const secondClaimAmount = stakedEthAmount
    .times(divaTokensPerEthPerDay)
    .times(BigInt.fromI32(fullStakingDays.secondPhaseStakingDays).toBigDecimal())
    .truncate(18);

  return new Rewards(
    halfOfFirstClaimAmount,
    halfOfFirstClaimAmount.plus(secondClaimAmount),
    halfOfFirstClaimAmount.plus(halfOfFirstClaimAmount.plus(secondClaimAmount)),
  );
}
