import { ethereum } from '@graphprotocol/graph-ts';
import { CancelOrder, Exchange } from '../generated/schema';
import { Context } from '../context';

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

// export function createTrade(
//   event: ethereum.Event,
//   method: string,
//   exchange: Exchange,
//   assetSold: Asset,
//   assetBought: Asset,
// ): Trade {
// let fund = context.entities.fund;
// let holdingsPreTrade = context.entities.fund.holdings;
// // pre trade quantities
// let assetSoldQuantityPreTrade = BigInt.fromI32(0);
// let assetBoughtQuantityPreTrade = BigInt.fromI32(0);
// for (let i: i32 = 0; i < holdingsPreTrade.length; i++) {
//   let holding = useFundHolding(holdingsPreTrade[i]) as FundHolding;
//   if (holding.asset == assetSold.id) {
//     assetSoldQuantityPreTrade = holding.quantity;
//   }
//   if (holding.asset == assetBought.id) {
//     assetBoughtQuantityPreTrade = holding.quantity;
//   }
// }
// updateFundHoldings(event, context);
// // post trade quantites
// let holdingsPostTrade = context.entities.fund.holdings;
// let assetSoldQuantityPostTrade = BigInt.fromI32(0);
// let assetBoughtQuantityPostTrade = BigInt.fromI32(0);
// for (let i: i32 = 0; i < holdingsPostTrade.length; i++) {
//   let holding = useFundHolding(holdingsPostTrade[i]) as FundHolding;
//   if (holding.asset == assetSold.id) {
//     assetSoldQuantityPostTrade = holding.quantity;
//   }
//   if (holding.asset == assetBought.id) {
//     assetBoughtQuantityPostTrade = holding.quantity;
//   }
// }
// let trade = new Trade(tradeId(event, fund.id));
// trade.fund = fund.id;
// trade.exchange = exchange.id;
// trade.methodName = method;
// trade.assetSold = assetSold.id;
// trade.assetBought = assetBought.id;
// trade.amountSold = assetSoldQuantityPreTrade.minus(assetSoldQuantityPostTrade);
// trade.amountBought = assetBoughtQuantityPostTrade.minus(assetBoughtQuantityPreTrade);
// trade.timestamp = event.block.timestamp;
// trade.transaction = event.transaction.hash.toHex();
// trade.save();
// return trade;
// }

export function cancelOrder(exchange: Exchange, context: Context): void {
  let event = context.event;
  let fund = context.entities.fund;
  let cancelOrder = new CancelOrder(tradeId(context));
  cancelOrder.fund = fund.id;
  cancelOrder.exchange = exchange.id;
  cancelOrder.timestamp = event.block.timestamp;
  cancelOrder.save();
}
