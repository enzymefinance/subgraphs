import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Depositor, Redemption } from '../generated/schema';
import { Claim, Tranche } from '../utils/tranches';

function redemptionId(depositor: Depositor, event: ethereum.Event): string {
  return depositor.id.toHex() + '/' + uniqueEventId(event);
}

export function createRedemption(
  depositor: Depositor,
  tranches: Tranche[],
  accruedRewards: Claim,
  gavBeforeActivity: BigDecimal,
  vault: Address,
  event: ethereum.Event,
): Redemption {
  let redemption = new Redemption(redemptionId(depositor, event));

  redemption.depositor = depositor.id;
  redemption.vault = vault;
  redemption.gavBeforeActivity = gavBeforeActivity;
  redemption.amounts = tranches.map<BigDecimal>((tranche) => tranche.amount);
  redemption.trancheIds = tranches.map<i32>((tranche) => tranche.id as i32);
  redemption.firstClaimAmount = accruedRewards.firstClaimAmount;
  redemption.secondClaimAmount = accruedRewards.secondClaimAmount;
  redemption.createdAt = event.block.timestamp.toI32();
  redemption.save();

  return redemption;
}
