import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { toBigDecimal } from '../../../utils/utils/math';
import { ChainlinkAggregatorContract } from '../generated/ChainlinkAggregatorContract';
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
  let btcEth = getLatestBtcEthPrice();

  // All prices are vs. ETH
  currencyPrice = new CurrencyPrice(id);
  currencyPrice.aud = getLatestCurrencyPrice('aud').div(ethUsd);
  currencyPrice.btc = btcEth;
  currencyPrice.chf = getLatestCurrencyPrice('chf').div(ethUsd);
  currencyPrice.eur = getLatestCurrencyPrice('eur').div(ethUsd);
  currencyPrice.gbp = getLatestCurrencyPrice('gbp').div(ethUsd);
  currencyPrice.jpy = getLatestCurrencyPrice('jpy').div(ethUsd);
  currencyPrice.usd = BigDecimal.fromString('1').div(ethUsd);
  currencyPrice.save();

  return currencyPrice;
}

function getLatestEthUsdPrice(): BigDecimal {
  let aggregator = ChainlinkAggregatorContract.bind(ETHUSD_AGGREGATOR);
  let latestAnswer = aggregator.try_latestAnswer();

  if (latestAnswer.reverted) {
    return BigDecimal.fromString('0');
  }

  let price = toBigDecimal(latestAnswer.value, 8);

  return price;
}

function getLatestCurrencyPrice(currency: string): BigDecimal {
  let aggregator = ChainlinkAggregatorContract.bind(aggregatorAddressForCurrency(currency));
  let latestAnswer = aggregator.try_latestAnswer();

  if (latestAnswer.reverted) {
    return BigDecimal.fromString('0');
  }

  let price = toBigDecimal(latestAnswer.value, 8);

  return price;
}

function getLatestBtcEthPrice(): BigDecimal {
  let aggregator = ChainlinkAggregatorContract.bind(BTCETH_AGGREGATOR);
  let latestAnswer = aggregator.try_latestAnswer();

  if (latestAnswer.reverted) {
    return BigDecimal.fromString('0');
  }

  let price = toBigDecimal(latestAnswer.value, 18);

  return price;
}
