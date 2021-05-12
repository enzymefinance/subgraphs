import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { IChainlinkAggregatorContract } from '../generated/IChainlinkAggregatorContract';
import { CurrencyPrice } from '../generated/schema';
import { aggregatorAddressForCurrency, BTCETH_AGGREGATOR, ETHUSD_AGGREGATOR } from '../utils/aggregatorAddresses';

export function currencyPriceId(event: ethereum.Event): string {
  return event.block.timestamp.toString();
}

export function ensureCurrencyPrice(event: ethereum.Event): CurrencyPrice {
  let id = currencyPriceId(event);
  let currencyPrice = CurrencyPrice.load(id) as CurrencyPrice;
  if (currencyPrice) {
    return currencyPrice;
  }

  let ethUsd = getLatestEthUsdPrice();

  // All prices are vs. ETH
  currencyPrice = new CurrencyPrice(id);
  currencyPrice.timestamp = event.block.timestamp;
  currencyPrice.aud = getLatestCurrencyPrice('aud').div(ethUsd);
  currencyPrice.btc = getLatestBtcEthPrice();
  currencyPrice.chf = getLatestCurrencyPrice('chf').div(ethUsd);
  currencyPrice.eur = getLatestCurrencyPrice('eur').div(ethUsd);
  currencyPrice.gbp = getLatestCurrencyPrice('gbp').div(ethUsd);
  currencyPrice.jpy = getLatestCurrencyPrice('jpy').div(ethUsd);
  currencyPrice.usd = BigDecimal.fromString('1').div(ethUsd);
  currencyPrice.save();

  return currencyPrice;
}

function getLatestEthUsdPrice(): BigDecimal {
  let aggregator = IChainlinkAggregatorContract.bind(ETHUSD_AGGREGATOR);
  let latestAnswer = aggregator.try_latestAnswer();

  if (latestAnswer.reverted) {
    return BigDecimal.fromString('0');
  }

  let price = toBigDecimal(latestAnswer.value, 8);

  return price;
}

function getLatestCurrencyPrice(currency: string): BigDecimal {
  let aggregator = IChainlinkAggregatorContract.bind(aggregatorAddressForCurrency(currency));
  let latestAnswer = aggregator.try_latestAnswer();

  if (latestAnswer.reverted) {
    return BigDecimal.fromString('0');
  }

  let price = toBigDecimal(latestAnswer.value, 8);

  return price;
}

function getLatestBtcEthPrice(): BigDecimal {
  let aggregator = IChainlinkAggregatorContract.bind(BTCETH_AGGREGATOR);
  let latestAnswer = aggregator.try_latestAnswer();

  if (latestAnswer.reverted) {
    return BigDecimal.fromString('0');
  }

  let price = toBigDecimal(latestAnswer.value, 18);

  return price;
}
