import { ZERO_BD, logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import {
  currentTvlAmountId,
  decreaseAmount,
  getAmount,
  increaseAmount,
  sumOfDepositsAmountId,
  sumOfRedemptionsAmountId,
} from '../entities/Amount';
import {
  activeDepositorsCounterId,
  decreaseCounter,
  depositsCounterId,
  increaseCounter,
  redemptionsCounterId,
} from '../entities/Counter';
import { createDeposit } from '../entities/Deposit';
import { ensureDepositor, useDepositor } from '../entities/Depositor';
import { createRedemption } from '../entities/Redemption';
import { SharesBought, SharesRedeemed } from '../generated/contracts/ComptrollerLibEvents';
import { stakingEndTimestamp } from '../utils/constants';
import { createDepositTrancheAmounts, createRedemptionTrancheAmountsForAllDeposits } from '../utils/tranches';

export function handleSharesBought(event: SharesBought): void {
  if (event.block.timestamp.ge(stakingEndTimestamp)) {
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

  let tvlBeforeActivity = getAmount(currentTvlAmountId);
  let tranches = createDepositTrancheAmounts(tvlBeforeActivity, investmentAmount, event);

  createDeposit(depositor, tranches, sharesReceived, tvlBeforeActivity, event.address, event);

  increaseCounter(depositsCounterId, timestamp);
  increaseAmount(sumOfDepositsAmountId, investmentAmount, timestamp);
  increaseAmount(currentTvlAmountId, investmentAmount, timestamp);
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  if (event.block.timestamp.ge(stakingEndTimestamp)) {
    // staking period ended
    return;
  }

  let timestamp = event.block.timestamp.toI32();

  let depositor = useDepositor(event.params.redeemer);

  if (depositor.shares == ZERO_BD) {
    logCritical('Depositor {} does not own any shares.', [depositor.id.toHex()]);
  }

  let sharesRedeemed = toBigDecimal(event.params.sharesAmount);
  let redemptionAmount = depositor.amount.times(sharesRedeemed).div(depositor.shares).truncate(18);

  depositor.shares = depositor.shares.minus(sharesRedeemed);
  depositor.amount = depositor.amount.minus(redemptionAmount);
  depositor.updatedAt = timestamp;
  depositor.save();

  let tvlBeforeActivity = getAmount(currentTvlAmountId);
  let redemptionTrancheAmounts = createRedemptionTrancheAmountsForAllDeposits(
    depositor.deposits.load(),
    redemptionAmount,
    event,
  );

  createRedemption(depositor, redemptionTrancheAmounts, sharesRedeemed, tvlBeforeActivity, event.address, event);

  if (depositor.shares === ZERO_BD) {
    decreaseCounter(activeDepositorsCounterId, timestamp);
  }

  increaseCounter(redemptionsCounterId, timestamp);
  increaseAmount(sumOfRedemptionsAmountId, redemptionAmount, timestamp);
  decreaseAmount(currentTvlAmountId, redemptionAmount, timestamp);
}
