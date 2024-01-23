import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { ZERO_BD, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Depositor, Redemption } from '../generated/schema';
import { Claim, Tranche, tranchesConfig } from '../utils/tranches';
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

  // init array with zeroes
  let trancheAmounts = tranchesConfig.map<BigDecimal>(() => ZERO_BD);
  let amount = ZERO_BD;

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    trancheAmounts[tranche.id] = tranche.amount;
    amount = amount.plus(tranche.amount)
  }

  redemption.amount = amount;
  redemption.trancheAmounts = trancheAmounts;
  redemption.depositor = depositor.id;
  redemption.vault = vault;
  redemption.gavBeforeActivity = gavBeforeActivity;
  redemption.activityType = 'Redemption';
  redemption.activityCounter = increaseCounter(activitiesCounterId, timestamp);
  redemption.firstClaimAmount = accruedRewards.firstClaimAmount;
  redemption.secondClaimAmount = accruedRewards.secondClaimAmount;
  redemption.createdAt = timestamp;
  redemption.save();

  return redemption;
}
