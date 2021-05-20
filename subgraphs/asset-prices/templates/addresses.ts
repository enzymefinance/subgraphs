import { Address } from '@graphprotocol/graph-ts';

export let wethTokenAddress = Address.fromString('{{wethToken}}');

export let audCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.AUD}}');
export let btcCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.BTC}}');
export let chfCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.CHF}}');
export let eurCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.EUR}}');
export let gbpCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.GBP}}');
export let usdCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.USD}}');
export let jpyCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.JPY}}');
