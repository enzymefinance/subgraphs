import { toBigDecimal, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { AggregatorProxyContract } from '../../generated/AggregatorProxyContract';
import { Aggregator } from '../../generated/schema';

export function fetchLatestAnswer(aggregator: Aggregator): BigDecimal {
  let contract = AggregatorProxyContract.bind(Address.fromString(aggregator.id));
  let result = contract.try_latestAnswer();
  if (result.reverted) {
    return ZERO_BD;
  }

  let decimals = aggregator.type == 'USD' ? 8 : 18;
  return toBigDecimal(result.value, decimals);
}
