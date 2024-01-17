import { createDeposit, decreaseTrancheAmountsOfDeposit } from '../entities/Deposit';
import { SharesBought, SharesRedeemed } from '../generated/contracts/ComptrollerLibEvents';
import {
  getAccruedRewards,
  getDepositTranches,
  getRedemptionTranchesForDeposits,
  getSumOfRedemptionTranches,
  stakingEndTimestamp,
} from '../utils/tranches';
import {
  useDepositor,
  updateDepositor,
  createDepositor,
  getDepositor,
  getDepositorDeposits,
} from '../entities/Depositor';
import { createRedemption } from '../entities/Redemption';
import { BigDecimal } from '@graphprotocol/graph-ts';
import {
  ensureGeneralInfo,
  increaseDepositorCounter,
  increaseVaultsGav,
  decreaseVaultsGav,
  decreaseDepositorCounter,
} from '../entities/GeneralInfo';
import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { useComptroller } from '../entities/Comptroller';

export function handleSharesBought(event: SharesBought): void {
  if (stakingEndTimestamp < event.block.timestamp) {
    return; // staking period ended
  }

  let sharesReceived = toBigDecimal(event.params.sharesReceived, 18);
  let investmentAmount = toBigDecimal(event.params.investmentAmount, 18); // all possible to deposit assets has 18 decimals

  let vaultsGavBeforeDeposit = ensureGeneralInfo().vaultsGav;
  increaseVaultsGav(investmentAmount, event); // we are using 1 ETH = 1 stETH rate

  let tranches = getDepositTranches(vaultsGavBeforeDeposit, investmentAmount);

  let comptroller = useComptroller(event.address);
  createDeposit(event.params.buyer, tranches, comptroller.vault, event);

  let depositor = getDepositor(event.params.buyer);

  if (depositor) {
    updateDepositor(depositor, sharesReceived, investmentAmount, event);
  } else {
    createDepositor(event.params.buyer, sharesReceived, investmentAmount, event);
    increaseDepositorCounter(1, event);
  }
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let depositor = useDepositor(event.params.redeemer);

  let sharesAmount = toBigDecimal(event.params.sharesAmount, 18);

  let redeemAmount = depositor.amount.times(sharesAmount).div(depositor.shares);

  decreaseVaultsGav(redeemAmount, event);

  let deposits = getDepositorDeposits(event.params.redeemer).sort((a, b) => b.createdAt - a.createdAt);

  let redemptionTranches = getRedemptionTranchesForDeposits(deposits, redeemAmount);

  let comptroller = useComptroller(event.address);
  let accruedRewards = getAccruedRewards(event.block.timestamp, redemptionTranches);
  createRedemption(
    event.params.redeemer,
    getSumOfRedemptionTranches(redemptionTranches),
    accruedRewards,
    comptroller.vault,
    event,
  );

  for (let i = 0; i < redemptionTranches.length; i++) {
    let redemptionTranche = redemptionTranches[i];
    decreaseTrancheAmountsOfDeposit(redemptionTranche.deposit.id, redemptionTranche.tranches, event);
  }

  let updatedDepositor = updateDepositor(depositor, sharesAmount.neg(), redeemAmount.neg(), event);
  if (updatedDepositor.shares.equals(BigDecimal.zero())) {
    decreaseDepositorCounter(1, event);
  }
}
