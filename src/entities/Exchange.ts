import { Address } from '@graphprotocol/graph-ts';
import { Context } from '../context';
import { Exchange } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useExchange(id: string): Exchange {
  let exchange = Exchange.load(id);
  if (exchange == null) {
    logCritical('Failed to load exchange {}.', [id]);
  }

  return exchange as Exchange;
}

export function ensureExchange(address: Address, context: Context): Exchange {
  let exchange = Exchange.load(address.toHex()) as Exchange;
  if (exchange) {
    return exchange;
  }

  // TODO: Add exchange names.
  exchange = new Exchange(address.toHex());
  exchange.save();

  return exchange;
}
