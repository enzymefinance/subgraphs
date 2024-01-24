import { ONE_DAY } from '@enzymefinance/subgraph-utils';
import { BigInt, BigDecimal } from '@graphprotocol/graph-ts';

export let mainnetLaunchTimestamp = BigInt.fromI32(1702594800);
// Production: 1711839600 is Sat Mar 30 2024 23:00:00 GMT+0000
// Testing: 1702594800 is Thu Dec 14 2023 23:00:00 GMT+0000

export let cooldownDays: i32 = 30;

export let stakingStartBeforeLaunchDays: i32 = 30;

export let stakingStartTimestamp = mainnetLaunchTimestamp.minus(
  BigInt.fromI32(stakingStartBeforeLaunchDays).times(ONE_DAY),
);

export let cooldownEndTimestamp = mainnetLaunchTimestamp.plus(BigInt.fromI32(cooldownDays).times(ONE_DAY));

export let stakingPeriodDays: i32 = 183;

export let stakingEndTimestamp = stakingStartTimestamp.plus(BigInt.fromI32(stakingPeriodDays).times(ONE_DAY));

export class StakingTranchesConfiguration {
  threshold: BigDecimal;
  divaPerEthPerDay: BigDecimal;

  constructor(threshold: BigDecimal, divaPerEthPerDay: BigDecimal) {
    this.threshold = threshold;
    this.divaPerEthPerDay = divaPerEthPerDay;
  }
}

export let stakingTranchesConfiguration: StakingTranchesConfiguration[] = [
  new StakingTranchesConfiguration(BigDecimal.fromString('10000'), BigDecimal.fromString('2.5')),
  new StakingTranchesConfiguration(BigDecimal.fromString('20000'), BigDecimal.fromString('2.25')),
  new StakingTranchesConfiguration(BigDecimal.fromString('30000'), BigDecimal.fromString('2')),
  new StakingTranchesConfiguration(BigDecimal.fromString('40000'), BigDecimal.fromString('1.9')),
  new StakingTranchesConfiguration(BigDecimal.fromString('50000'), BigDecimal.fromString('1.75')),
  new StakingTranchesConfiguration(BigDecimal.fromString('60000'), BigDecimal.fromString('1.6')),
  new StakingTranchesConfiguration(BigDecimal.fromString('70000'), BigDecimal.fromString('1.55')),
  new StakingTranchesConfiguration(BigDecimal.fromString('80000'), BigDecimal.fromString('1.5')),
  new StakingTranchesConfiguration(BigDecimal.fromString('90000'), BigDecimal.fromString('1.4')),
  new StakingTranchesConfiguration(BigDecimal.fromString('100000'), BigDecimal.fromString('1.3')),
];
