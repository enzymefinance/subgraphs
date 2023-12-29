import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts';
import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Redemption } from '../generated/schema';

function redemptionId(redeemer: Address, event: ethereum.Event): string {
  return redeemer + '/' + uniqueEventId(event);
}

export function createRedemption(
  redeemer: Address,
  tranches: { amount: BigInt; id: number }[],
  event: ethereum.Event,
): Redemption {
  let redemption = new Redemption(redemptionId(redeemer, event));

  redemption.redeemer = redeemer;
  redemption.amounts = tranches.map<BigInt>((tranche) => tranche.amount);
  redemption.trancheIds = tranches.map<number>((tranche) => tranche.id);
  redemption.createdAt = event.block.timestamp.toI32();
  redemption.save();

  return redemption;
}
