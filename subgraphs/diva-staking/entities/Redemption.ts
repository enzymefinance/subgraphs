import { ZERO_BD, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Depositor, Redemption, TrancheAmount } from '../generated/schema';
import { useComptroller } from './Comptroller';
import { activitiesCounterId, increaseCounter } from './Counter';

export function createRedemption(
  depositor: Depositor,
  trancheAmounts: TrancheAmount[],
  shares: BigDecimal,
  tvlBeforeActivity: BigDecimal,
  comptroller: Address,
  event: ethereum.Event,
): Redemption {
  let redemption = new Redemption(uniqueEventId(event));
  let timestamp = event.block.timestamp.toI32();

  // init array with zeroes
  let amount = ZERO_BD;
  let firstPhaseRewards = ZERO_BD;
  let secondPhaseRewards = ZERO_BD;
  let totalRewards = ZERO_BD;

  for (let i = 0; i < trancheAmounts.length; i++) {
    let trancheAmount = trancheAmounts[i];

    amount = amount.plus(trancheAmount.amount);
    firstPhaseRewards = firstPhaseRewards.plus(trancheAmount.firstPhaseRewards);
    secondPhaseRewards = secondPhaseRewards.plus(trancheAmount.secondPhaseRewards);
    totalRewards = totalRewards.plus(trancheAmount.totalRewards);
  }

  redemption.createdAt = timestamp;
  redemption.shares = shares;
  redemption.amount = amount;
  redemption.trancheAmounts = trancheAmounts.map<string>((trancheAmount) => trancheAmount.id);
  redemption.depositor = depositor.id;
  redemption.vault = useComptroller(comptroller).vault;
  redemption.tvlBeforeActivity = tvlBeforeActivity;
  redemption.activityType = 'Redemption';
  redemption.activityCounter = increaseCounter(activitiesCounterId, timestamp);
  redemption.firstPhaseRewards = firstPhaseRewards;
  redemption.secondPhaseRewards = secondPhaseRewards;
  redemption.totalRewards = totalRewards;
  redemption.save();

  return redemption;
}
