import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { toBigDecimal, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { AggregatorProxyContract } from '../generated/AggregatorProxyContract';
import { Aggregator } from '../generated/schema';

export function fetchLatestAnswer(aggregator: Aggregator): BigDecimal {
  let contract = AggregatorProxyContract.bind(Address.fromString(aggregator.id));
  let result = contract.try_latestAnswer();
  if (result.reverted) {
    return ZERO_BD;
  }

  return toBigDecimal(result.value, aggregator.decimals);
}
