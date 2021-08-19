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
  let currencyValue = CurrencyPrice.load(id) as CurrencyPrice;
  if (currencyValue) {
    return currencyValue;
  }

  let ethUsd = getLatestEthUsdPrice();

  // All prices are vs. ETH
  currencyValue = new CurrencyPrice(id);
  currencyValue.timestamp = event.block.timestamp;
  currencyValue.ethAud = ethUsd.div(getLatestCurrencyPrice('aud'));
  currencyValue.ethBtc = BigDecimal.fromString('1').div(getLatestBtcEthPrice());
  currencyValue.ethChf = ethUsd.div(getLatestCurrencyPrice('chf'));
  currencyValue.ethEur = ethUsd.div(getLatestCurrencyPrice('eur'));
  currencyValue.ethGbp = ethUsd.div(getLatestCurrencyPrice('gbp'));
  currencyValue.ethJpy = ethUsd.div(getLatestCurrencyPrice('jpy'));
  currencyValue.ethUsd = ethUsd;
  currencyValue.save();

  return currencyValue;
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
