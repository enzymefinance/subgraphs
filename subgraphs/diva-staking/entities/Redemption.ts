import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Redemption } from '../generated/schema';
import { Claim, Tranche } from '../utils/tranches';

function redemptionId(redeemer: Address, event: ethereum.Event): string {
  return redeemer.toHexString() + '/' + uniqueEventId(event);
}

export function createRedemption(
  redeemer: Address,
  tranches: Tranche[],
  accruedRewards: Claim,
  event: ethereum.Event,
): Redemption {
  let redemption = new Redemption(redemptionId(redeemer, event));

  redemption.redeemer = redeemer;
  redemption.amounts = tranches.map<BigDecimal>((tranche) => tranche.amount);
  redemption.trancheIds = tranches.map<i32>((tranche) => tranche.id as i32);
  redemption.firstClaimAmount = accruedRewards.firstClaimAmount;
  redemption.secondClaimAmount = accruedRewards.secondClaimAmount;
  redemption.createdAt = event.block.timestamp.toI32();
  redemption.save();

  return redemption;
}
