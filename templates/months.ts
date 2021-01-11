import { BigInt } from '@graphprotocol/graph-ts';

export let startsOfMonths: BigInt[] = [
{{#each months}}
  BigInt.fromI32({{start}}),
{{/each}}
];
