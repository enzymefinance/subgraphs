import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { toBigDecimal, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { SharedSdk } from '../generated/contracts/SharedSdk';
import { Aggregator } from '../generated/schema';

export function fetchLatestAnswer(aggregator: Aggregator): BigDecimal {
  let contract = SharedSdk.bind(Address.fromString(aggregator.id));
  let result = contract.try_latestAnswer();
  if (result.reverted) {
    return ZERO_BD;
  }

  return toBigDecimal(result.value, aggregator.decimals);
}
