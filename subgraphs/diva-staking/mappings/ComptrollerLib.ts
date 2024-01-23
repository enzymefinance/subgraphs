import { createDeposit } from '../entities/Deposit';
import { SharesBought, SharesRedeemed } from '../generated/contracts/ComptrollerLibEvents';
import {
  decreaseTrancheAmountsOfDeposit,
  getAccruedRewards,
  getDepositTranches,
  getRedemptionTranchesForDeposits,
  getSumOfRedemptionTranches,
  stakingEndTimestamp,
} from '../utils/tranches';
import { useDepositor, ensureDepositor } from '../entities/Depositor';
import { createRedemption } from '../entities/Redemption';
import { Address } from '@graphprotocol/graph-ts';

import { ZERO_BD, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { useComptroller } from '../entities/Comptroller';
import {
  activeDepositorsCounterId,
  decreaseCounter,
  depositsCounterId,
  increaseCounter,
  redemptionsCounterId,
} from '../entities/Counter';
import {
  currentGavAmountId,
  decreaseAmount,
  getAmount,
  increaseAmount,
  sumOfDepositsAmountId,
  sumOfRedemptionsAmountId,
} from '../entities/Amount';

export function handleSharesBought(event: SharesBought): void {
  if (stakingEndTimestamp < event.block.timestamp) {
    return; // staking period ended
  }

  let timestamp = event.block.timestamp.toI32();

  let sharesReceived = toBigDecimal(event.params.sharesReceived, 18);
  let investmentAmount = toBigDecimal(event.params.investmentAmount, 18); // all possible to deposit assets has 18 decimals

  let gavBeforeActivity = getAmount(currentGavAmountId);

  let comptroller = useComptroller(event.address);

  let depositor = ensureDepositor(event.params.buyer, event);
  depositor.shares = depositor.shares.plus(sharesReceived);
  depositor.amount = depositor.amount.plus(investmentAmount);
  depositor.save();

  let tranches = getDepositTranches(gavBeforeActivity, investmentAmount);

  createDeposit(depositor, tranches, sharesReceived, gavBeforeActivity, Address.fromBytes(comptroller.vault), event);

  increaseCounter(depositsCounterId, timestamp);
  increaseAmount(sumOfDepositsAmountId, investmentAmount, timestamp);
  increaseAmount(currentGavAmountId, investmentAmount, timestamp);
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let depositor = useDepositor(event.params.redeemer);
  let timestamp = event.block.timestamp.toI32();

  let sharesAmount = toBigDecimal(event.params.sharesAmount, 18);

  let redeemAmount = depositor.amount.times(sharesAmount).div(depositor.shares).truncate(18);

  let gavBeforeActivity = getAmount(currentGavAmountId);

  let deposits = depositor.deposits.load().sort((a, b) => b.createdAt - a.createdAt);

  let redemptionTranches = getRedemptionTranchesForDeposits(deposits, redeemAmount);

  let comptroller = useComptroller(event.address);
  let accruedRewards = getAccruedRewards(event.block.timestamp, redemptionTranches);

  createRedemption(
    depositor,
    getSumOfRedemptionTranches(redemptionTranches),
    accruedRewards,
    sharesAmount,
    gavBeforeActivity,
    Address.fromBytes(comptroller.vault),
    event,
  );

  for (let i = 0; i < redemptionTranches.length; i++) {
    let redemptionTranche = redemptionTranches[i];
    decreaseTrancheAmountsOfDeposit(
      redemptionTranche.deposit.id,
      redemptionTranche.tranches,
      event.block.timestamp.toI32(),
    );
  }

  depositor.shares = depositor.shares.minus(sharesAmount);
  depositor.amount = depositor.amount.minus(redeemAmount);
  depositor.updatedAt = timestamp;
  depositor.save();

  if (depositor.shares.equals(ZERO_BD)) {
    decreaseCounter(activeDepositorsCounterId, timestamp);
  }

  increaseCounter(redemptionsCounterId, timestamp);
  increaseAmount(sumOfRedemptionsAmountId, redeemAmount, timestamp);
  decreaseAmount(currentGavAmountId, redeemAmount, timestamp);
}
