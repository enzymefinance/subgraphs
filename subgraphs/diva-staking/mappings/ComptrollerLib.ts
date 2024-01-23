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
import {
  useDepositor,
  ensureDepositor,
} from '../entities/Depositor';
import { createRedemption } from '../entities/Redemption';
import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import {
  ensureGeneralInfo,
} from '../entities/GeneralInfo';
import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { useComptroller } from '../entities/Comptroller';

export function handleSharesBought(event: SharesBought): void {
  if (stakingEndTimestamp < event.block.timestamp) {
    return; // staking period ended
  }

  let sharesReceived = toBigDecimal(event.params.sharesReceived, 18);
  let investmentAmount = toBigDecimal(event.params.investmentAmount, 18); // all possible to deposit assets has 18 decimals

  let generalInfo = ensureGeneralInfo();

  let comptroller = useComptroller(event.address);

  let depositor = ensureDepositor(event.params.buyer, event);
  depositor.shares = depositor.shares.plus(sharesReceived);
  depositor.amount = depositor.amount.plus(investmentAmount)
  depositor.save();

  let tranches = getDepositTranches(generalInfo.vaultsGav, investmentAmount);

  createDeposit(depositor, tranches, generalInfo.vaultsGav, Address.fromBytes(comptroller.vault), event);

  generalInfo.vaultsGav = generalInfo.vaultsGav.plus(investmentAmount);
  generalInfo.updatedAt = event.block.timestamp.toI32();
  generalInfo.save();
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let depositor = useDepositor(event.params.redeemer);

  let sharesAmount = toBigDecimal(event.params.sharesAmount, 18);

  let redeemAmount = depositor.amount.times(sharesAmount).div(depositor.shares);

  let generalInfo = ensureGeneralInfo();

  let deposits = depositor.deposits.load().sort((a, b) => b.createdAt - a.createdAt);

  let redemptionTranches = getRedemptionTranchesForDeposits(deposits, redeemAmount);

  let comptroller = useComptroller(event.address);
  let accruedRewards = getAccruedRewards(event.block.timestamp, redemptionTranches);

  createRedemption(
    depositor,
    getSumOfRedemptionTranches(redemptionTranches),
    accruedRewards,
    generalInfo.vaultsGav,
    Address.fromBytes(comptroller.vault),
    event,
  );

  for (let i = 0; i < redemptionTranches.length; i++) {
    let redemptionTranche = redemptionTranches[i];
    decreaseTrancheAmountsOfDeposit(redemptionTranche.deposit.id, redemptionTranche.tranches, event.block.timestamp.toI32());
  }

  depositor.shares = depositor.shares.minus(sharesAmount);
  depositor.amount = depositor.amount.minus(redeemAmount);
  depositor.updatedAt = event.block.timestamp.toI32()
  depositor.save();

  if (depositor.shares.equals(BigDecimal.zero())) {
    generalInfo.depositorsCounterActive = (generalInfo.depositorsCounterActive - 1) as i32;
  }

  generalInfo.vaultsGav = generalInfo.vaultsGav.minus(redeemAmount);
  generalInfo.updatedAt = event.block.timestamp.toI32();
  generalInfo.save();
}
