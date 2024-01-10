import { createDeposit } from '../entities/Deposit';
import { SharesBought, SharesRedeemed } from '../generated/contracts/ComptrollerLibEvents';
import {
  // getAccruedRewards,
  getDepositTranches,
  getRedemptionTranches,
} from '../utils/tranches';
import { useDepositor, updateDepositor, createDepositor, getDepositor } from '../entities/Depositor';
import { createRedemption } from '../entities/Redemption';
import { BigDecimal } from '@graphprotocol/graph-ts';
import { ensureGeneralInfo, updateDepositorCounter, updateVaulsGav } from '../entities/GeneralInfo';
import { toBigDecimal } from '@enzymefinance/subgraph-utils';

export function handleSharesBought(event: SharesBought): void {
  let vaultsGavBeforeDeposit = ensureGeneralInfo().vaultsGav;
  let investmentAmount = toBigDecimal(event.params.investmentAmount, 18); // all possible to deposit assets has 18 decimals
  updateVaulsGav(investmentAmount, event);

  let tranches = getDepositTranches(vaultsGavBeforeDeposit, investmentAmount);

  createDeposit(event.params.buyer, tranches, event);

  let depositor = getDepositor(event.params.buyer);
  let sharesReceived = toBigDecimal(event.params.sharesReceived, 18);

  if (depositor) {
    updateDepositor(depositor, sharesReceived, investmentAmount, event);
  } else {
    createDepositor(event.params.buyer, sharesReceived, investmentAmount, event);
    updateDepositorCounter(1, event); // increase by 1
  }
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let depositor = useDepositor(event.params.redeemer);

  let sharesAmount = toBigDecimal(event.params.sharesAmount, 18);

  let redeemAmount = depositor.amount.times(sharesAmount).div(depositor.shares);

  updateVaulsGav(redeemAmount.neg(), event);

  let deposits = depositor.deposits.entries[0].key;

  let tranches = getRedemptionTranches(depositor.deposits, redeemAmount);
  // let accruedRewards = getAccruedRewards(event.block.timestamp, tranches);

  // createRedemption(event.params.redeemer, tranches, accruedRewards, event);

  let updatedDepositor = updateDepositor(
    depositor,
    toBigDecimal(event.params.sharesAmount, 18).neg(),
    redeemAmount.neg(),
    event,
  );

  if (updatedDepositor.shares.equals(BigDecimal.zero())) {
    updateDepositorCounter(-1, event); // decrease by 1
  }
}
