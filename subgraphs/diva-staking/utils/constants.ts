import { ONE_DAY } from '@enzymefinance/subgraph-utils';
import { BigInt, BigDecimal } from '@graphprotocol/graph-ts';

export let mainnetLaunchTimestamp = BigInt.fromI32(1711839600); // 31st March 2024

export let cooldownDays: i32 = 30;

export let stakingStartBeforeLaunchDays: i32 = 30;

export let stakingStartTimestamp = mainnetLaunchTimestamp.minus(
  BigInt.fromI32(stakingStartBeforeLaunchDays).times(ONE_DAY),
);

export let cooldownEndTimestamp = mainnetLaunchTimestamp.plus(BigInt.fromI32(cooldownDays).times(ONE_DAY));

export let stakingPeriodDays: i32 = 183;

export let stakingEndTimestamp = stakingStartTimestamp.plus(BigInt.fromI32(stakingPeriodDays).times(ONE_DAY));

export class TrancheConfig {
  threshold: BigDecimal;
  divaPerEthPerDay: BigDecimal;

  constructor(threshold: BigDecimal, divaPerEthPerDay: BigDecimal) {
    this.threshold = threshold;
    this.divaPerEthPerDay = divaPerEthPerDay;
  }
}

export let tranchesConfig: TrancheConfig[] = [
  new TrancheConfig(BigDecimal.fromString('10000'), BigDecimal.fromString('2.5')),
  new TrancheConfig(BigDecimal.fromString('20000'), BigDecimal.fromString('2.25')),
  new TrancheConfig(BigDecimal.fromString('30000'), BigDecimal.fromString('2')),
  new TrancheConfig(BigDecimal.fromString('40000'), BigDecimal.fromString('1.9')),
  new TrancheConfig(BigDecimal.fromString('50000'), BigDecimal.fromString('1.75')),
  new TrancheConfig(BigDecimal.fromString('60000'), BigDecimal.fromString('1.6')),
  new TrancheConfig(BigDecimal.fromString('70000'), BigDecimal.fromString('1.55')),
  new TrancheConfig(BigDecimal.fromString('80000'), BigDecimal.fromString('1.5')),
  new TrancheConfig(BigDecimal.fromString('90000'), BigDecimal.fromString('1.4')),
  new TrancheConfig(BigDecimal.fromString('100000'), BigDecimal.fromString('1.3')),
];
