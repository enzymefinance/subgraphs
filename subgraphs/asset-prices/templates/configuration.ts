import { Address } from '@graphprotocol/graph-ts';

export let wethTokenAddress = Address.fromString('{{wethToken}}');

export let audCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.AUD}}');
export let btcCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.BTC}}');
export let chfCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.CHF}}');
export let eurCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.EUR}}');
export let gbpCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.GBP}}');
export let usdCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.USD}}');
export let jpyCurrencyAggregatorAddress = Address.fromString('{{currencyAggregatorProxies.JPY}}');

export let valueInterpreterV2Address = Address.fromString('{{or releaseConfiguration.v2.valueInterpreter "0x0000000000000000000000000000000000000000"}}');
export let valueInterpreterV3Address = Address.fromString('{{or releaseConfiguration.v3.valueInterpreter "0x0000000000000000000000000000000000000000"}}');
export let valueInterpreterV4Address = Address.fromString('{{or releaseConfiguration.v4.valueInterpreter "0x0000000000000000000000000000000000000000"}}');
