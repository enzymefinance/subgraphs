import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import { chainlinkAggregatorAddresses } from '../generated/addresses';

export function aggregatorAddressForCurrency(currency: string): Address {
  if (currency == 'aud') {
    return chainlinkAggregatorAddresses.audUsdAddress;
  }

  if (currency == 'chf') {
    return chainlinkAggregatorAddresses.chfusdAddress;
  }

  if (currency == 'eur') {
    return chainlinkAggregatorAddresses.eurUsdAddress;
  }

  if (currency == 'gbp') {
    return chainlinkAggregatorAddresses.gbpUsdAddress;
  }

  if (currency == 'jpy') {
    return chainlinkAggregatorAddresses.jpyUsdAddress;
  }

  return ZERO_ADDRESS;
}
