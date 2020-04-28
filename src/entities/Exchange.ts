import { Address, log } from '@graphprotocol/graph-ts';
import { Context } from '../context';
import { Exchange } from '../generated/schema';

export function ensureExchange(address: Address, context: Context): Exchange {
  let exchange = Exchange.load(address.toHex()) as Exchange;
  if (exchange) {
    return exchange;
  }

  //   let contract = context.contracts.registry;
  //   if (!contract.assetIsRegistered(address)) {
  //     log.critical('Tried to initialize asset {} that is not currently registered.', [address.toHex()]);
  //   }

  exchange = new Exchange(address.toHex());
  exchange.save();

  return exchange;
}
