import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { chainlinkAggregatorAddresses } from '../generated/addresses';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import { CurrencyPrice } from '../generated/schema';
import { aggregatorAddressForCurrency } from '../utils/aggregatorAddresses';

export function currencyPriceId(event: ethereum.Event): string {
  return event.block.timestamp.toString();
}

export function ensureCurrencyPrice(event: ethereum.Event): CurrencyPrice {
  let id = currencyPriceId(event);
  let currencyValue = CurrencyPrice.load(id);
  if (currencyValue) {
    return currencyValue;
  }

  let ethUsd = getLatestEthUsdPrice();
  let btcEth = getLatestBtcEthPrice();
  let audUsd = getLatestCurrencyPrice('aud');
  let chfUsd = getLatestCurrencyPrice('chf');
  let eurUsd = getLatestCurrencyPrice('eur');
  let gbpUsd = getLatestCurrencyPrice('gbp');
  let jpyUsd = getLatestCurrencyPrice('jpy');

  // All prices are vs. ETH
  currencyValue = new CurrencyPrice(id);
  currencyValue.timestamp = event.block.timestamp.toI32();
  currencyValue.ethAud = audUsd.notEqual(BigDecimal.fromString('0')) ? ethUsd.div(audUsd) : BigDecimal.fromString('0');
  currencyValue.ethBtc = btcEth.notEqual(BigDecimal.fromString('0'))
    ? BigDecimal.fromString('1').div(btcEth)
    : BigDecimal.fromString('0');
  currencyValue.ethChf = chfUsd.notEqual(BigDecimal.fromString('0')) ? ethUsd.div(chfUsd) : BigDecimal.fromString('0');
  currencyValue.ethEur = eurUsd.notEqual(BigDecimal.fromString('0')) ? ethUsd.div(eurUsd) : BigDecimal.fromString('0');
  currencyValue.ethGbp = gbpUsd.notEqual(BigDecimal.fromString('0')) ? ethUsd.div(gbpUsd) : BigDecimal.fromString('0');
  currencyValue.ethJpy = jpyUsd.notEqual(BigDecimal.fromString('0')) ? ethUsd.div(jpyUsd) : BigDecimal.fromString('0');
  currencyValue.ethUsd = ethUsd;
  currencyValue.save();

  return currencyValue;
}

function getLatestEthUsdPrice(): BigDecimal {
  let aggregator = ProtocolSdk.bind(chainlinkAggregatorAddresses.ethUsdAddress);
  let latestAnswer = aggregator.try_latestAnswer();

  if (latestAnswer.reverted) {
    return BigDecimal.fromString('0');
  }

  let price = toBigDecimal(latestAnswer.value, 8);

  return price;
}

function getLatestCurrencyPrice(currency: string): BigDecimal {
  let aggregator = ProtocolSdk.bind(aggregatorAddressForCurrency(currency));
  let latestAnswer = aggregator.try_latestAnswer();

  if (latestAnswer.reverted) {
    return BigDecimal.fromString('0');
  }

  let price = toBigDecimal(latestAnswer.value, 8);

  return price;
}

function getLatestBtcEthPrice(): BigDecimal {
  let aggregator = ProtocolSdk.bind(chainlinkAggregatorAddresses.btcEthAddress);
  let latestAnswer = aggregator.try_latestAnswer();

  if (latestAnswer.reverted) {
    return BigDecimal.fromString('0');
  }

  let price = toBigDecimal(latestAnswer.value, 18);

  return price;
}
