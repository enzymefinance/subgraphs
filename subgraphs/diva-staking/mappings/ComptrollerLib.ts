import { createDeposit } from '../entities/Deposit';
import { SharesBought, SharesRedeemed } from '../generated/contracts/ComptrollerLibEvents';
import { createRedemptionTrancheAmountsForAllDeposits, createDepositTrancheAmounts } from '../utils/tranches';
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
import { stakingEndTimestamp } from '../utils/constants';

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

  let tranches = createDepositTrancheAmounts(gavBeforeActivity, investmentAmount, event);

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

  let deposits = depositor.deposits.load();

  let redemptionTrancheAmounts = createRedemptionTrancheAmountsForAllDeposits(deposits, redeemAmount, event);

  let comptroller = useComptroller(event.address);

  createRedemption(
    depositor,
    redemptionTrancheAmounts,
    sharesAmount,
    gavBeforeActivity,
    Address.fromBytes(comptroller.vault),
    event,
  );

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
