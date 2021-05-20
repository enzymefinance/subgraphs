import { Address } from '@graphprotocol/graph-ts';
import { AggregatorProxyContract } from '../../generated/AggregatorProxyContract';

export function fetchAggregatorType(address: Address): string {
  let contract = AggregatorProxyContract.bind(address);
  let decimalsResult = contract.try_decimals();
  if (decimalsResult.reverted) {
    return 'ETH';
  }

  return decimalsResult.value == 8 ? 'USD' : 'ETH';
}
