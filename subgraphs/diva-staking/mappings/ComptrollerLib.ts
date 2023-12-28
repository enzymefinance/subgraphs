import { BigInt } from '@graphprotocol/graph-ts';
import { createDeposit } from '../entities/Deposit';
import { SharesBought, SharesRedeemed } from '../generated/contracts/ComptrollerLibEvents';
import { calcVaultsGav } from '../utils/calcVaultsGav';
import { getDepositTranches } from '../utils/tranches';

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

  updateDepositor();
}

export function handleSharesRedeemed(event: SharesRedeemed): void {}
