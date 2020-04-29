import { Entity, Value, BigInt, log, ethereum } from '@graphprotocol/graph-ts';
import { Fund, Asset } from '../generated/schema';
import { Context } from '../context';

function fundHoldingId(event: ethereum.Event, fund: Fund, asset: Asset): string {
  return fund.id + '/' + asset.id + '/' + event.block.timestamp.toString();
}

// export function useFundHolding(id: string): FundHolding {
//   let holding = FundHolding.load(id);
//   if (holding == null) {
//     log.critical('Failed to load fund FundHolding {}.', [id]);
//   }
//   return holding as FundHolding;
// }
// export function createFundHolding(
//   event: ethereum.Event,
//   asset: Asset,
//   quantity: BigInt,
//   context: Context,
// ): FundHolding {
//   let fund = context.entities.fund;
//   let holding = new FundHolding(fundHoldingId(event, fund, asset));
//   holding.fund = fund.id;
//   holding.asset = asset.id;
//   holding.quantity = quantity;
//   holding.timestamp = event.block.timestamp;
//   holding.save();
//   return holding;
// }
