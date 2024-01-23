import { ONE_DAY, ZERO_BD, logCritical } from '@enzymefinance/subgraph-utils';
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
import { RedemptionTranchesForDepositResponse, tranchesConfig } from './tranches';

class DaysStakedResponse {
  firstPhaseStakingDays: i32;
  secondPhaseStakingDays: i32;

  constructor(firstPhaseStakingDays: i32, secondPhaseStakingDays: i32) {
    this.firstPhaseStakingDays = firstPhaseStakingDays;
    this.secondPhaseStakingDays = secondPhaseStakingDays;

    if (this.firstPhaseStakingDays > stakingStartBeforeLaunchDays + cooldownDays) {
      logCritical('Invalid firstStepDays', []);
    }

    if (this.secondPhaseStakingDays > stakingPeriodDays - stakingStartBeforeLaunchDays) {
      logCritical('Invalid secondStepDays');
    }
  }
}

export class AccruedRewards {
  firstPhaseAccruedRewards: BigDecimal;
  secondPhaseAccruedRewards: BigDecimal;

  constructor(firstPhaseAccruedRewards: BigDecimal, secondPhaseAccruedRewards: BigDecimal) {
    this.firstPhaseAccruedRewards = firstPhaseAccruedRewards;
    this.secondPhaseAccruedRewards = secondPhaseAccruedRewards;
  }
}

function secondsToFullDays(seconds: BigInt): i32 {
  return seconds.div(ONE_DAY).toI32();
}

function calculateFullStakingDays(depositCreatedAt: BigInt, redemptionTimestamp: BigInt): DaysStakedResponse {
  // Calculate full staking days for redemptions
  // Note that this doesn't run for the cases without redemption (since there is no event to run it for)
  let depositStakingStartTimestamp =
    depositCreatedAt < stakingStartTimestamp ? stakingStartTimestamp : depositCreatedAt;

  if (redemptionTimestamp < mainnetLaunchTimestamp) {
    // Redemption happened before mainnet launch
    // -> no rewards whatsoever
    return new DaysStakedResponse(0, 0);
  }

  if (redemptionTimestamp < cooldownEndTimestamp) {
    // Redemption happened after mainnet launch but before cooldown period ended
    // -> rewards only for first claim
    return new DaysStakedResponse(secondsToFullDays(redemptionTimestamp.minus(depositStakingStartTimestamp)), 0);
  }

  if (depositStakingStartTimestamp < cooldownEndTimestamp) {
    // Staking happened before cooldown period ended
    // Redemption happened after cooldown period ended
    // -> rewards for first and second claim
    return new DaysStakedResponse(
      secondsToFullDays(cooldownEndTimestamp.minus(depositStakingStartTimestamp)),
      Math.min(
        secondsToFullDays(redemptionTimestamp.minus(cooldownEndTimestamp)),
        stakingPeriodDays - cooldownDays - stakingStartBeforeLaunchDays,
      ) as i32,
    );
  }

  if (depositStakingStartTimestamp < stakingEndTimestamp) {
    // Staking happened after cooldown period ended
    // Redemption happened after cooldown period and before staking ended
    // -> rewards only for second claim
    return new DaysStakedResponse(0, secondsToFullDays(redemptionTimestamp.minus(depositStakingStartTimestamp)));
  }

  // Staking happened after cooldown period ended
  // Redemption happened after stake period ended
  // -> rewards only for second claim
  return new DaysStakedResponse(0, secondsToFullDays(stakingEndTimestamp.minus(depositStakingStartTimestamp)));
}

export function getAccruedRewards(
  redemptionTimestamp: BigInt,
  redemptionTranchesForDeposits: RedemptionTranchesForDepositResponse[],
): AccruedRewards {
  let firstPhaseAccruedRewards = ZERO_BD;
  let secondPhaseAccruedRewards = ZERO_BD;

  for (let i = 0; i < redemptionTranchesForDeposits.length; i++) {
    let redemptionTranchesForDeposit = redemptionTranchesForDeposits[i];

    let createdAt = BigInt.fromI64(redemptionTranchesForDeposit.deposit.createdAt);
    let fullStakingDays = calculateFullStakingDays(createdAt, redemptionTimestamp);

    for (let i = 0; i < redemptionTranchesForDeposit.tranches.length; i++) {
      let tranche = redemptionTranchesForDeposit.tranches[i];

      let trancheAccruedRewards = getAccruedRewardsForSingleTranche(
        tranche.amount,
        tranchesConfig[tranche.id].divPerEthPerDay,
        fullStakingDays.firstPhaseStakingDays,
        fullStakingDays.secondPhaseStakingDays,
      );

      firstPhaseAccruedRewards = firstPhaseAccruedRewards.plus(trancheAccruedRewards.firstPhaseAccruedRewards);
      secondPhaseAccruedRewards = secondPhaseAccruedRewards.plus(trancheAccruedRewards.secondPhaseAccruedRewards);
    }
  }

  return new AccruedRewards(firstPhaseAccruedRewards, secondPhaseAccruedRewards);
}

function getAccruedRewardsForSingleTranche(
  stakedEthAmount: BigDecimal,
  divaTokensPerEthPerDay: BigDecimal,
  firstPhaseStakingDays: i32,
  secondPhaseStakingDays: i32,
): AccruedRewards {
  let halfOfFirstClaimAmount = stakedEthAmount
    .times(divaTokensPerEthPerDay)
    .times(BigInt.fromI32(firstPhaseStakingDays).toBigDecimal())
    .div(BigDecimal.fromString('2'));

  let secondClaimAmount = stakedEthAmount
    .times(divaTokensPerEthPerDay)
    .times(BigInt.fromI32(secondPhaseStakingDays).toBigDecimal());

  return new AccruedRewards(halfOfFirstClaimAmount, halfOfFirstClaimAmount.plus(secondClaimAmount));
}
