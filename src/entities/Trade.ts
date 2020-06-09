import { BigDecimal } from '@graphprotocol/graph-ts';
import { Exchange, Asset, Trade, Holding } from '../generated/schema';
import { Context } from '../context';
import { trackFundPortfolio, useHolding, usePortfolio } from './Tracking';
import { contractEventId } from './Event';

export function tradeId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;

  return (
    fund.id +
    '/' +
    event.block.timestamp.toString() +
    '/' +
    event.transaction.hash.toHex() +
    '/' +
    event.logIndex.toString()
  );
}

function getAssetQuantities(assets: Asset[], context: Context): BigDecimal[] {
  let holdings = usePortfolio(context.entities.state.portfolio).holdings.map<Holding>((holding) => useHolding(holding));

  let quantities: BigDecimal[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    let quantity = BigDecimal.fromString('0');

    for (let j: i32 = 0; j < holdings.length; j++) {
      if (holdings[j].asset == assets[i].id) {
        quantity = holdings[j].quantity;
        break;
      }
    }

    quantities = quantities.concat([quantity]);
  }

  return quantities;
}

export function createTrade(
  method: string,
  exchange: Exchange,
  assetSold: Asset,
  assetBought: Asset,
  context: Context,
): Trade {
  let event = context.event;
  let fund = context.entities.fund;
  let trade = new Trade(tradeId(context));

  // TODO: This tracking is not guaranteed to yield the correct numbers
  // but it's the best we can do currently. Whenever the current block
  // is "polluted" with multiple events that cause fund portfolio
  // tracking, the values in "before" might already include the traded
  // values.
  let before = getAssetQuantities([assetSold, assetBought], context);
  trackFundPortfolio(trade, context);
  let after = getAssetQuantities([assetSold, assetBought], context);

  trade.kind = 'TRADE';
  trade.fund = fund.id;
  trade.version = context.entities.version.id;
  trade.exchange = exchange.id;
  trade.methodName = method;
  trade.assetSold = assetSold.id;
  trade.assetBought = assetBought.id;
  trade.amountSold = before[0].minus(after[0]);
  trade.amountBought = after[1].minus(before[1]);
  trade.timestamp = event.block.timestamp;
  trade.transaction = event.transaction.hash.toHex();
  trade.trigger = contractEventId(context);
  trade.save();

  return trade;
}

export function cancelOrder(exchange: Exchange, context: Context): void {
  // let event = context.event;
  // let fund = context.entities.fund;
  // let cancelOrder = new CancelOrder(tradeId(context));
  // cancelOrder.fund = fund.id;
  // cancelOrder.exchange = exchange.id;
  // cancelOrder.timestamp = event.block.timestamp;
  // cancelOrder.save();
}
