import { createDeposit } from '../entities/Deposit';
import { SharesBought, SharesRedeemed } from '../generated/contracts/ComptrollerLibEvents';
import { createRedemptionTrancheAmountsForAllDeposits, createDepositTrancheAmounts } from '../utils/tranches';
import { useDepositor, ensureDepositor } from '../entities/Depositor';
import { createRedemption } from '../entities/Redemption';
import { Address } from '@graphprotocol/graph-ts';
import { ZERO_BD, logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
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
import { stakingEndTimestamp } from '../utils/constants';

export function handleSharesBought(event: SharesBought): void {
  if (event.block.timestamp.le(stakingEndTimestamp)) {
    // staking period ended
    return;
  }

  let timestamp = event.block.timestamp.toI32();

  let sharesReceived = toBigDecimal(event.params.sharesReceived);
  let investmentAmount = toBigDecimal(event.params.investmentAmount);

  let depositor = ensureDepositor(event.params.buyer, event);
  depositor.shares = depositor.shares.plus(sharesReceived);
  depositor.amount = depositor.amount.plus(investmentAmount);
  depositor.updatedAt = timestamp;
  depositor.save();

  let gavBeforeActivity = getAmount(currentGavAmountId);
  let tranches = createDepositTrancheAmounts(gavBeforeActivity, investmentAmount, event);

  createDeposit(depositor, tranches, sharesReceived, gavBeforeActivity, event.address, event);

  increaseCounter(depositsCounterId, timestamp);
  increaseAmount(sumOfDepositsAmountId, investmentAmount, timestamp);
  increaseAmount(currentGavAmountId, investmentAmount, timestamp);
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  if (event.block.timestamp.le(stakingEndTimestamp)) {
    // staking period ended
    return;
  }

  let timestamp = event.block.timestamp.toI32();

  let depositor = useDepositor(event.params.redeemer);

  if (depositor.shares.equals(ZERO_BD)) {
    logCritical('Depositor {} does not own any shares.', [depositor.id.toHex()]);
  }

  let sharesAmount = toBigDecimal(event.params.sharesAmount);
  let redeemAmount = depositor.amount.times(sharesAmount).div(depositor.shares).truncate(18);

  depositor.shares = depositor.shares.minus(sharesAmount);
  depositor.amount = depositor.amount.minus(redeemAmount);
  depositor.updatedAt = timestamp;
  depositor.save();

  let gavBeforeActivity = getAmount(currentGavAmountId);
  let redemptionTrancheAmounts = createRedemptionTrancheAmountsForAllDeposits(
    depositor.deposits.load(),
    redeemAmount,
    event,
  );

  createRedemption(depositor, redemptionTrancheAmounts, sharesAmount, gavBeforeActivity, event.address, event);

  if (depositor.shares.equals(ZERO_BD)) {
    decreaseCounter(activeDepositorsCounterId, timestamp);
  }

  increaseCounter(redemptionsCounterId, timestamp);
  increaseAmount(sumOfRedemptionsAmountId, redeemAmount, timestamp);
  decreaseAmount(currentGavAmountId, redeemAmount, timestamp);
}
