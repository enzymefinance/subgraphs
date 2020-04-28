import { context, Context } from '../context';
import { createFundEvent } from '../entities/Event';
import { ExchangeMethodCall, ExchangeMethodCall1 } from '../generated/TradingContract';
import { createTrade, cancelOrder } from '../entities/Trade';
import { useAsset } from '../entities/Asset';
import { exchangeMethodSignatureToName } from '../utils/exchangeMethodSignature';
import { ensureExchange } from '../entities/Exchange';

export function handleExchangeMethodCall(event: ExchangeMethodCall): void {
  let method = exchangeMethodSignatureToName(event.params.methodSignature.toHexString());
  let exchange = ensureExchange(event.params.exchangeAddress, context);

  if (method == 'cancelOrder') {
    cancelOrder(event, exchange);
    return;
  }

  let addresses = event.params.orderAddresses.map<string>((value) => value.toHex());
  let assetSold = useAsset(addresses[3]);
  let assetBought = useAsset(addresses[2]);

  createTrade(event, method, exchange, assetSold, assetBought);
  createFundEvent('Trade', event, context);
}

export function handleExchangeMethodCall1(event: ExchangeMethodCall1): void {
  let method = exchangeMethodSignatureToName(event.params.methodSignature.toHexString());
  let exchange = ensureExchange(event.params.exchangeAddress, context);

  if (method == 'cancelOrder') {
    cancelOrder(event, exchange);
    return;
  }

  let addresses = event.params.orderAddresses.map<string>((value) => value.toHex());
  let assetSold = useAsset(addresses[3]);
  let assetBought = useAsset(addresses[2]);

  createTrade(event, method, exchange, assetSold, assetBought);
  createFundEvent('Trade', event, context);
}
