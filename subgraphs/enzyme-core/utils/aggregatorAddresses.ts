import { Address } from '@graphprotocol/graph-ts';
import { ZERO_ADDRESS } from '../../../utils/constants';

export let ETHUSD_AGGREGATOR = Address.fromString('0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419');

export let BTCETH_AGGREGATOR = Address.fromString('0xdeb288F737066589598e9214E782fa5A8eD689e8');

export let AUDUSD_AGGREGATOR = Address.fromString('0x77F9710E7d0A19669A13c055F62cd80d313dF022');
export let BTCUSD_AGGREGATOR = Address.fromString('0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c');
export let CHFUSD_AGGREGATOR = Address.fromString('0x449d117117838fFA61263B61dA6301AA2a88B13A');
export let EURUSD_AGGREGATOR = Address.fromString('0xb49f677943BC038e9857d61E7d053CaA2C1734C1');
export let GBPUSD_AGGREGATOR = Address.fromString('0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5');
export let JPYUSD_AGGREGATOR = Address.fromString('0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3');

export function aggregatorAddressForCurrency(currency: string): Address {
  if (currency == 'aud') {
    return AUDUSD_AGGREGATOR;
  }

  if (currency == 'chf') {
    return CHFUSD_AGGREGATOR;
  }

  if (currency == 'eur') {
    return EURUSD_AGGREGATOR;
  }

  if (currency == 'gbp') {
    return GBPUSD_AGGREGATOR;
  }

  if (currency == 'jpy') {
    return JPYUSD_AGGREGATOR;
  }

  return ZERO_ADDRESS;
}
