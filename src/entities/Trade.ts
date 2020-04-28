import { ethereum, BigInt } from '@graphprotocol/graph-ts';
import { FundHolding, Trade, Asset, Fund } from '../generated/schema';
import { context } from '../context';
import { ExchangeMethodCall } from '../generated/TradingContract';
import { useAsset } from './Asset';
import { useFundHolding } from './Holding';
import { exchangeMethodSignatureToName } from '../utils/exchangeMethodSignature';

export function tradeId(event: ethereum.Event, fundId: string, assetSold: Asset, assetBought: Asset): string {
  return event.block.timestamp.toString() + '/' + fundId + '/' + assetSold.id + '/' + assetBought.id;
}

export function createTrade(
  event: ExchangeMethodCall,
  holdingsPreTrade: string[],
  holdingsPostTrade: FundHolding[],
): Trade {
  let fund = context.entities.fund;

  let addresses = event.params.orderAddresses.map<string>((value) => value.toHex());
  let assetSold = useAsset(addresses[3]);
  let assetBought = useAsset(addresses[2]);

  let assetSoldQuantityPreTrade = BigInt.fromI32(0);
  let assetBoughtQuantityPreTrade = BigInt.fromI32(0);

  for (let i: i32 = 0; i < holdingsPreTrade.length; i++) {
    let holding = useFundHolding(holdingsPreTrade[i]) as FundHolding;
    if (holding.asset == assetSold.id) {
      assetSoldQuantityPreTrade = holding.quantity;
    }
    if (holding.asset == assetBought.id) {
      assetBoughtQuantityPreTrade = holding.quantity;
    }
  }

  let assetSoldQuantityPostTrade = BigInt.fromI32(0);
  let assetBoughtQuantityPostTrade = BigInt.fromI32(0);

  for (let i: i32 = 0; i < holdingsPostTrade.length; i++) {
    let holding = holdingsPostTrade[i] as FundHolding;
    if (holding.asset == assetSold.id) {
      assetSoldQuantityPostTrade = holding.quantity;
    }
    if (holding.asset == assetBought.id) {
      assetBoughtQuantityPostTrade = holding.quantity;
    }
  }

  let trade = new Trade(tradeId(event, fund.id, assetSold, assetBought));

  trade.fund = fund.id;

  trade.exchange = event.params.exchangeAddress.toHex();
  trade.methodName = exchangeMethodSignatureToName(event.params.methodSignature.toHexString());

  trade.assetSold = assetSold.id;
  trade.assetBought = assetBought.id;
  trade.amountSold = assetSoldQuantityPreTrade.minus(assetSoldQuantityPostTrade);
  trade.amountBought = assetBoughtQuantityPostTrade.minus(assetBoughtQuantityPreTrade);
  trade.timestamp = event.block.timestamp;
  trade.save();

  return trade;
}
