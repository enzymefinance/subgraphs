import { ONE_DAY } from '@enzymefinance/subgraph-utils';
import { BigInt } from '@graphprotocol/graph-ts';

export let mainnetLaunchTimestamp = BigInt.fromI32(1711839600); // 31st March 2024

export let cooldownDays: i32 = 30;

export let stakingStartBeforeLaunchDays: i32 = 30;

export let stakingStartTimestamp = mainnetLaunchTimestamp.minus(
  BigInt.fromI32(stakingStartBeforeLaunchDays).times(ONE_DAY),
);

export let cooldownEndTimestamp = mainnetLaunchTimestamp.plus(BigInt.fromI32(cooldownDays).times(ONE_DAY));

export let stakingPeriodDays: i32 = 183;

export let stakingEndTimestamp = stakingStartTimestamp.plus(BigInt.fromI32(stakingPeriodDays).times(ONE_DAY));
