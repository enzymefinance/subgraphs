import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { uniqueSortableEventId, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Currency, CurrencyValue } from '../../generated/schema';

function currencyValueId(currency: Currency, event: ethereum.Event): string {
  return currency.id + '/' + event.block.number.toString();
}

export function updateCurrencyValue(
  currency: Currency,
  eth: BigDecimal,
  usd: BigDecimal,
  event: ethereum.Event,
): CurrencyValue {
  let id = currencyValueId(currency, event);
  let entity = new CurrencyValue(id);
  entity.incremental = uniqueSortableEventId(event);
  entity.currency = currency.id;
  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp;
  entity.eth = eth;
  entity.usd = usd;
  entity.save();

  if (currency.value != entity.id) {
    currency.value = entity.id;
    currency.save();
  }

  return entity;
}

export function getLatestCurrencyValue(currency: Currency): CurrencyValue | null {
  if (currency.value == '') {
    return null;
  }

  return CurrencyValue.load(currency.value);
}

export function getLatestCurrencyValueInEth(currency: Currency): BigDecimal {
  let value = getLatestCurrencyValue(currency);
  return value == null ? ZERO_BD : value.eth;
}

export function getLatestCurrencyValueInUsd(currency: Currency): BigDecimal {
  let value = getLatestCurrencyValue(currency);
  return value == null ? ZERO_BD : value.usd;
}
