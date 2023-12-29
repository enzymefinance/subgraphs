import { BigInt } from '@graphprotocol/graph-ts';
import { createDeposit } from '../entities/Deposit';
import { SharesBought, SharesRedeemed } from '../generated/contracts/ComptrollerLibEvents';
import { calcVaultsGav } from '../utils/calcVaultsGav';
import { getDepositTranches, getRedemptionTranches } from '../utils/tranches';
import { getDepositor, createOrUpdateDepositor, updateDepositor } from '../entities/Depositor';
import { createRedemption } from '../entities/Redemption';

let stakingDeadline = BigInt.fromI32(1709251200); // 1st March 2024

export function handleSharesBought(event: SharesBought): void {
  // skip deposits after staking deadline
  if (stakingDeadline >= event.block.timestamp) {
    return;
  }

  let vaultsGav = calcVaultsGav();
  let investmentAmount = event.params.investmentAmount;
  let vaultsGavBeforeDeposit = vaultsGav.minus(investmentAmount);

  let tranches = getDepositTranches(vaultsGavBeforeDeposit, investmentAmount);

  createDeposit(event.params.buyer, tranches, event);

  createOrUpdateDepositor(event.params.buyer, tranches, event);
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let depositor = getDepositor(event.params.redeemer);

  if (depositor == null) {
    return;
  }

  // assumption that vault only holds stETH or WETH
  let redeemAmount = event.params.receivedAssetAmounts[0];

  let tranches = getRedemptionTranches(depositor.trancheAmounts, redeemAmount);

  createRedemption(event.params.redeemer, tranches, event);

  updateDepositor(depositor, tranches, event);
}
