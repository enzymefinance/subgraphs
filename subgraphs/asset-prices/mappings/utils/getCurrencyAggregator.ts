import { Address } from '@graphprotocol/graph-ts';
import { logCritical, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import {
  audCurrencyAggregatorAddress,
  btcCurrencyAggregatorAddress,
  chfCurrencyAggregatorAddress,
  eurCurrencyAggregatorAddress,
  gbpCurrencyAggregatorAddress,
  jpyCurrencyAggregatorAddress,
  usdCurrencyAggregatorAddress,
} from '../../generated/addresses';

export function getCurrencyAggregator(currency: string): Address {
  if (currency == 'USD') {
    return usdCurrencyAggregatorAddress;
  }

  if (currency == 'BTC') {
    return btcCurrencyAggregatorAddress;
  }

  if (currency == 'EUR') {
    return eurCurrencyAggregatorAddress;
  }

  if (currency == 'AUD') {
    return audCurrencyAggregatorAddress;
  }

  if (currency == 'CHF') {
    return chfCurrencyAggregatorAddress;
  }

  if (currency == 'GBP') {
    return gbpCurrencyAggregatorAddress;
  }

  if (currency == 'JPY') {
    return jpyCurrencyAggregatorAddress;
  }

  logCritical('Failed to retrieve aggregator address: {}', [currency]);

  return ZERO_ADDRESS;
}
