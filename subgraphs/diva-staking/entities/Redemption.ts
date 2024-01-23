import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Depositor, Redemption } from '../generated/schema';
import { Claim, Tranche } from '../utils/tranches';
import { activitiesCounterId, increaseCounter } from './Counter';

export function createRedemption(
  depositor: Depositor,
  tranches: Tranche[],
  accruedRewards: Claim,
  gavBeforeActivity: BigDecimal,
  vault: Address,
  event: ethereum.Event,
): Redemption {
  let redemption = new Redemption(uniqueEventId(event));
  let timestamp = event.block.timestamp.toI32();

  redemption.depositor = depositor.id;
  redemption.vault = vault;
  redemption.gavBeforeActivity = gavBeforeActivity;
  redemption.activityCounter = increaseCounter(activitiesCounterId, timestamp);
  redemption.amounts = tranches.map<BigDecimal>((tranche) => tranche.amount);
  redemption.trancheIds = tranches.map<i32>((tranche) => tranche.id);
  redemption.firstClaimAmount = accruedRewards.firstClaimAmount;
  redemption.secondClaimAmount = accruedRewards.secondClaimAmount;
  redemption.createdAt = timestamp;
  redemption.save();

  return redemption;
}
