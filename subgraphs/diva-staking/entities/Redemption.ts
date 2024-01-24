import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { ZERO_BD, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Depositor, Redemption, TrancheAmount } from '../generated/schema';
import { activitiesCounterId, increaseCounter } from './Counter';

export function createRedemption(
  depositor: Depositor,
  trancheAmounts: TrancheAmount[],
  shares: BigDecimal,
  gavBeforeActivity: BigDecimal,
  vault: Address,
  event: ethereum.Event,
): Redemption {
  let redemption = new Redemption(uniqueEventId(event));
  let timestamp = event.block.timestamp.toI32();

  // init array with zeroes
  let amount = ZERO_BD;
  let firstPhaseAccruedRewards = ZERO_BD;
  let secondPhaseAccruedRewards = ZERO_BD;

  for (let i = 0; i < trancheAmounts.length; i++) {
    let trancheAmount = trancheAmounts[i];

    amount = amount.plus(trancheAmount.amount);
    firstPhaseAccruedRewards = firstPhaseAccruedRewards.plus(trancheAmount.firstPhaseAccruedRewards);
    secondPhaseAccruedRewards = secondPhaseAccruedRewards.plus(trancheAmount.secondPhaseAccruedRewards);
  }

  redemption.shares = shares;
  redemption.amount = amount;
  redemption.trancheAmounts = trancheAmounts.map<string>((trancheAmount) => trancheAmount.id);
  redemption.depositor = depositor.id;
  redemption.vault = vault;
  redemption.gavBeforeActivity = gavBeforeActivity;
  redemption.activityType = 'Redemption';
  redemption.activityCounter = increaseCounter(activitiesCounterId, timestamp);
  redemption.firstPhaseAccruedRewards = firstPhaseAccruedRewards;
  redemption.secondPhaseAccruedRewards = secondPhaseAccruedRewards;
  redemption.createdAt = timestamp;
  redemption.save();

  return redemption;
}
