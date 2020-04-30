import { Exchange, Asset, Trade, Holding } from '../generated/schema';
import { Context } from '../context';
import { trackFundPortfolio, useHolding, usePortfolio } from './FundMetrics';
import { BigInt } from '@graphprotocol/graph-ts';
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

function getAssetQuantities(assets: Asset[], context: Context): BigInt[] {
  let holdings = usePortfolio(context.entities.fund.holdings).holdings.map<Holding>((holding) => useHolding(holding));

  let quantities: BigInt[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    let quantity = BigInt.fromI32(0);

    for (let j: i32 = 0; j < holdings.length; j++) {
      if (holdings[j].asset == assets[i].id) {
        quantity = holdings[j].quantity;
        break;
      }
    }

    quantities.push(quantity);
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

  let preTradeQuantities = getAssetQuantities([assetSold, assetBought], context);
  trackFundPortfolio([assetSold, assetBought], trade, context);
  let postTradeQuantities = getAssetQuantities([assetSold, assetBought], context);

  trade.kind = 'TRADE';
  trade.fund = fund.id;
  trade.version = context.entities.version.id;
  trade.exchange = exchange.id;
  trade.methodName = method;
  trade.assetSold = assetSold.id;
  trade.assetBought = assetBought.id;
  trade.amountSold = preTradeQuantities[0].minus(postTradeQuantities[0]);
  trade.amountBought = postTradeQuantities[0].minus(preTradeQuantities[1]);
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
