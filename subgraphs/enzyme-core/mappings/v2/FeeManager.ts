import { toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { ensureAccount } from '../../entities/Account';
import { ensureComptroller } from '../../entities/Comptroller';
import { getActivityCounter } from '../../entities/Counter';
import { ensureDeposit } from '../../entities/Deposit';
import { ensureEntranceRateBurnFee } from '../../entities/EntranceRateBurnFee';
import { ensureEntranceRateDirectFee } from '../../entities/EntranceRateDirectFee';
import { feeId } from '../../entities/Fee';
import { ensureManagementFee } from '../../entities/ManagementFee';
import { ensurePerformanceFee } from '../../entities/PerformanceFee';
import { ensureUnknownFee } from '../../entities/UnknownFee';
import { useVault } from '../../entities/Vault';
import { release2Addresses } from '../../generated/addresses';
import {
  AllSharesOutstandingForcePaidForFund,
  FeeDeregistered,
  FeeEnabledForFund,
  FeeRegistered,
  FeeSettledForFund,
  FeesRecipientSetForFund,
  SharesOutstandingPaidForFund,
} from '../../generated/contracts/FeeManager2Events';
import {
  FeeSharesAllocationChangedEvent,
  FeeSharesBurnedEvent,
  FeeSharesPaidEvent,
  FeeSharesReceivedEvent,
} from '../../generated/schema';
import { settlementType } from '../../utils/settlementType';

export function handleFeeEnabledForFund(event: FeeEnabledForFund): void {
  let comptrollerAddress = event.params.comptrollerProxy;
  let feeAddress = event.params.fee;

  if (event.params.fee.equals(release2Addresses.entranceRateBurnFeeAddress)) {
    let fee = ensureEntranceRateBurnFee(comptrollerAddress, feeAddress, event);
    fee.settings = event.params.settingsData.toHex();
    fee.save();
    return;
  }

  if (event.params.fee.equals(release2Addresses.entranceRateDirectFeeAddress)) {
    let fee = ensureEntranceRateDirectFee(comptrollerAddress, feeAddress, event);
    fee.settings = event.params.settingsData.toHex();
    fee.save();
    return;
  }

  if (event.params.fee.equals(release2Addresses.managementFeeAddress)) {
    let fee = ensureManagementFee(comptrollerAddress, feeAddress, event);
    fee.settings = event.params.settingsData.toHex();
    fee.save();
    return;
  }

  if (event.params.fee.equals(release2Addresses.performanceFeeAddress)) {
    let fee = ensurePerformanceFee(comptrollerAddress, feeAddress, 'CRYSTALLIZATION_PERIOD', event);
    fee.settings = event.params.settingsData.toHex();
    fee.save();
    return;
  }

  let fee = ensureUnknownFee(comptrollerAddress, feeAddress, event);
  fee.settings = event.params.settingsData.toHex();
  fee.save();
}

export function handleFeeSettledForFund(event: FeeSettledForFund): void {
  let comptrollerProxy = ensureComptroller(event.params.comptrollerProxy, event);
  if (comptrollerProxy.vault == null) {
    return;
  }

  let vault = useVault(comptrollerProxy.vault as string);
  let shares = toBigDecimal(event.params.sharesDue);

  // Differentiate between settlement types
  let feeSettlementType = settlementType(event.params.settlementType);
  if (feeSettlementType == 'Direct') {
    // Direct - payment of fee shares from an depositor to the fee recipient
    let payeeAccount = ensureAccount(event.params.payee, event);
    let payeeDeposit = ensureDeposit(payeeAccount, vault, event);

    let paid = new FeeSharesPaidEvent(uniqueEventId(event, 'FeeSharesPaid'));
    paid.vault = vault.id;
    paid.depositor = payeeAccount.id;
    paid.deposit = payeeDeposit.id;
    paid.sharesChangeType = 'FeeSharesPaid';
    paid.timestamp = event.block.timestamp.toI32();
    paid.shares = shares;
    paid.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    paid.activityCounter = getActivityCounter();
    paid.activityCategories = ['Vault', 'Depositor'];
    paid.activityType = 'FeeShares';
    paid.save();

    let payerAccount = ensureAccount(event.params.payer, event);
    let payerDeposit = ensureDeposit(payerAccount, vault, event);

    let received = new FeeSharesReceivedEvent(uniqueEventId(event, 'FeeSharesReceived'));
    received.vault = vault.id;
    received.depositor = payerAccount.id;
    received.deposit = payerDeposit.id;
    received.sharesChangeType = 'FeeSharesReceived';
    received.timestamp = event.block.timestamp.toI32();
    received.shares = shares;
    received.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    received.activityCounter = getActivityCounter();
    received.activityCategories = ['Vault', 'Depositor'];
    received.activityType = 'FeeShares';
    received.save();
  } else if (feeSettlementType == 'Mint') {
    // Mint - mint new shares for fee recipient
    let depositor = ensureAccount(event.params.payee, event);
    let deposit = ensureDeposit(depositor, vault, event);

    let received = new FeeSharesReceivedEvent(uniqueEventId(event));
    received.vault = vault.id;
    received.depositor = depositor.id;
    received.deposit = deposit.id;
    received.sharesChangeType = 'FeeSharesReceived';
    received.timestamp = event.block.timestamp.toI32();
    received.shares = shares;
    received.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    received.activityCounter = getActivityCounter();
    received.activityCategories = ['Vault', 'Depositor'];
    received.activityType = 'FeeShares';
    received.save();
  } else if (feeSettlementType == 'Burn') {
    // Burn - burn shares of depositor
    let depositor = ensureAccount(event.params.payer, event);
    let deposit = ensureDeposit(depositor, vault, event);

    let burned = new FeeSharesBurnedEvent(uniqueEventId(event));
    burned.vault = vault.id;
    burned.depositor = depositor.id;
    burned.deposit = deposit.id;
    burned.sharesChangeType = 'FeeSharesBurned';
    burned.timestamp = event.block.timestamp.toI32();
    burned.shares = shares;
    burned.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    burned.activityCounter = getActivityCounter();
    burned.activityCategories = ['Vault', 'Depositor'];
    burned.activityType = 'FeeShares';
    burned.save();
  } else if (feeSettlementType == 'MintSharesOutstanding') {
    // MintSharesOutstanding - Allocate fee shares (vault is temporary owner)
    let depositor = ensureAccount(event.params.payee, event);
    let deposit = ensureDeposit(depositor, vault, event);

    let allocated = new FeeSharesAllocationChangedEvent(uniqueEventId(event));
    allocated.vault = vault.id;
    allocated.depositor = depositor.id;
    allocated.deposit = deposit.id;
    allocated.sharesChangeType = 'FeeSharesAllocationChanged';
    allocated.timestamp = event.block.timestamp.toI32();
    allocated.shares = shares;
    allocated.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    allocated.activityCounter = getActivityCounter();
    allocated.activityCategories = ['Vault'];
    allocated.activityType = 'FeeShares';
    allocated.save();
  } else if (feeSettlementType == 'BurnSharesOutstanding') {
    // BurnSharesOutstanding - Remove allocated fee shares (from vault as temporary owner)
    let depositor = ensureAccount(event.params.payee, event);
    let deposit = ensureDeposit(depositor, vault, event);

    let allocated = new FeeSharesAllocationChangedEvent(uniqueEventId(event));
    allocated.vault = vault.id;
    allocated.depositor = depositor.id;
    allocated.deposit = deposit.id;
    allocated.sharesChangeType = 'FeeSharesAllocationChanged';
    allocated.timestamp = event.block.timestamp.toI32();
    allocated.shares = BigDecimal.fromString('0').minus(shares);
    allocated.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    allocated.activityCounter = getActivityCounter();
    allocated.activityCategories = ['Vault'];
    allocated.activityType = 'FeeShares';
    allocated.save();
  }
}

export function handleAllSharesOutstandingForcePaidForFund(event: AllSharesOutstandingForcePaidForFund): void {
  let comptrollerProxy = ensureComptroller(event.params.comptrollerProxy, event);
  if (comptrollerProxy.vault == null) {
    return;
  }

  let vault = useVault(comptrollerProxy.vault as string);
  let depositor = ensureAccount(event.params.payee, event);
  let shares = toBigDecimal(event.params.sharesDue);
  let deposit = ensureDeposit(depositor, vault, event);

  let paidOut = new FeeSharesReceivedEvent(uniqueEventId(event));
  paidOut.vault = vault.id;
  paidOut.depositor = depositor.id;
  paidOut.deposit = deposit.id;
  paidOut.sharesChangeType = 'FeeSharesReceived';
  paidOut.timestamp = event.block.timestamp.toI32();
  paidOut.shares = shares;
  paidOut.fee = null;
  paidOut.activityCounter = getActivityCounter();
  paidOut.activityCategories = ['Vault', 'Depositor'];
  paidOut.activityType = 'FeeShares';
  paidOut.save();
}

export function handleSharesOutstandingPaidForFund(event: SharesOutstandingPaidForFund): void {
  let comptrollerProxy = ensureComptroller(event.params.comptrollerProxy, event);
  if (comptrollerProxy.vault == null) {
    return;
  }

  let vault = useVault(comptrollerProxy.vault as string);
  let depositor = ensureAccount(Address.fromString(vault.owner), event);
  let shares = toBigDecimal(event.params.sharesDue);
  let deposit = ensureDeposit(depositor, vault, event);

  let paidOut = new FeeSharesReceivedEvent(uniqueEventId(event));
  paidOut.vault = vault.id;
  paidOut.depositor = depositor.id;
  paidOut.deposit = deposit.id;
  paidOut.sharesChangeType = 'FeeSharesReceived';
  paidOut.timestamp = event.block.timestamp.toI32();
  paidOut.shares = shares;
  paidOut.fee = feeId(event.params.comptrollerProxy, event.params.fee);
  paidOut.activityCounter = getActivityCounter();
  paidOut.activityCategories = ['Vault', 'Depositor'];
  paidOut.activityType = 'FeeShares';
  paidOut.save();
}

export function handleFeeDeregistered(event: FeeDeregistered): void {}
export function handleFeeRegistered(event: FeeRegistered): void {}
export function handleFeesRecipientSetForFund(event: FeesRecipientSetForFund): void {}
