import { createDeposit } from '../entities/Deposit';
import { SharesBought, SharesRedeemed } from '../generated/contracts/ComptrollerLibEvents';
import { calcVaultsGav } from '../utils/calcVaultsGav';
import {
  getAccruedRewards,
  getDepositTranches,
  getRedemptionTranches,
  stakingDeadlineTimestamp,
} from '../utils/tranches';
import { getDepositor, updateDepositor, createDepositor } from '../entities/Depositor';
import { createRedemption } from '../entities/Redemption';
import { store } from '@graphprotocol/graph-ts';
import { updateDepositorCounter } from '../entities/GeneralInfo';

export function handleSharesBought(event: SharesBought): void {
  // skip deposits after staking deadline
  if (stakingDeadlineTimestamp < event.block.timestamp) {
    return;
  }

  let vaultsGav = calcVaultsGav();
  let investmentAmount = event.params.investmentAmount;
  let vaultsGavBeforeDeposit = vaultsGav.minus(investmentAmount);

  let tranches = getDepositTranches(vaultsGavBeforeDeposit, investmentAmount);

  createDeposit(event.params.buyer, tranches, event);

  let depositor = getDepositor(event.params.buyer);

  if (depositor) {
    updateDepositor(depositor, tranches, event.params.sharesReceived, event);
  } else {
    createDepositor(event.params.buyer, tranches, event.params.sharesReceived, event);
    updateDepositorCounter(1, event); // increase by 1
  }
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let depositor = getDepositor(event.params.redeemer);

  if (depositor == null) {
    return;
  }

  // assumption that vault will redeem ETH/stETH/divaETH
  let redeemAmount = event.params.receivedAssetAmounts[0];

  let tranches = getRedemptionTranches(depositor.trancheAmounts, redeemAmount);
  let accruedRewards = getAccruedRewards(event.block.timestamp, tranches);

  createRedemption(event.params.redeemer, tranches, accruedRewards, event);

  let updatedDepositor = updateDepositor(depositor, tranches, event.params.sharesAmount.neg(), event);

  if (updatedDepositor.shares.isZero()) {
    store.remove('Depositor', updatedDepositor.id);
    updateDepositorCounter(-1, event); // decrease by 1
  }
}
