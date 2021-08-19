import { toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { ensureAccount } from '../../entities/Account';
import { ensureComptroller } from '../../entities/Comptroller';
import { ensureEntranceRateBurnFee } from '../../entities/EntranceRateBurnFee';
import { ensureEntranceRateDirectFee } from '../../entities/EntranceRateDirectFee';
import { feeId } from '../../entities/Fee';
import { ensureInvestment } from '../../entities/Investment';
import { ensureManagementFee } from '../../entities/ManagementFee';
import { ensurePerformanceFee } from '../../entities/PerformanceFee';
import { ensureUnknownFee } from '../../entities/UnknownFee';
import { useVault } from '../../entities/Vault';
import { release3Addresses } from '../../generated/addresses';
import {
  AllSharesOutstandingForcePaidForFund,
  FeeDeregistered,
  FeeEnabledForFund,
  FeeRegistered,
  FeeSettledForFund,
  FeesRecipientSetForFund,
  SharesOutstandingPaidForFund,
} from '../../generated/FeeManager3Contract';
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

  if (event.params.fee.equals(release3Addresses.entranceRateBurnFeeAddress)) {
    let policy = ensureEntranceRateBurnFee(comptrollerAddress, feeAddress, event);
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.fee.equals(release3Addresses.entranceRateDirectFeeAddress)) {
    let policy = ensureEntranceRateDirectFee(comptrollerAddress, feeAddress, event);
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.fee.equals(release3Addresses.managementFeeAddress)) {
    let policy = ensureManagementFee(comptrollerAddress, feeAddress, event);
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.fee.equals(release3Addresses.performanceFeeAddress)) {
    let policy = ensurePerformanceFee(comptrollerAddress, feeAddress, event);
    policy.settings = event.params.settingsData.toHex();
    policy.save();
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

  let vault = useVault(comptrollerProxy.vault);
  let shares = toBigDecimal(event.params.sharesDue);

  // Differentiate between settlement types
  let feeSettlementType = settlementType(event.params.settlementType);
  if (feeSettlementType == 'Direct') {
    // Direct - payment of fee shares from an investor to the fee recipient
    let payeeAccount = ensureAccount(event.params.payee, event);
    let payeeInvestment = ensureInvestment(payeeAccount, vault, event);

    let paid = new FeeSharesPaidEvent(uniqueEventId(event, 'FeeSharesPaid'));
    paid.vault = vault.id;
    paid.investor = payeeAccount.id;
    paid.investment = payeeInvestment.id;
    paid.type = 'FeeSharesPaid';
    paid.timestamp = event.block.timestamp;
    paid.shares = shares;
    paid.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    paid.save();

    let payerAccount = ensureAccount(event.params.payer, event);
    let payerInvestment = ensureInvestment(payerAccount, vault, event);

    let received = new FeeSharesReceivedEvent(uniqueEventId(event, 'FeeSharesReceived'));
    received.vault = vault.id;
    received.investor = payerAccount.id;
    received.investment = payerInvestment.id;
    received.type = 'FeeSharesReceived';
    received.timestamp = event.block.timestamp;
    received.shares = shares;
    received.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    received.save();
  } else if (feeSettlementType == 'Mint') {
    // Mint - mint new shares for fee recipient
    let investor = ensureAccount(event.params.payee, event);
    let investment = ensureInvestment(investor, vault, event);

    let received = new FeeSharesReceivedEvent(uniqueEventId(event));
    received.vault = vault.id;
    received.investor = investor.id;
    received.investment = investment.id;
    received.type = 'FeeSharesReceived';
    received.timestamp = event.block.timestamp;
    received.shares = shares;
    received.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    received.save();
  } else if (feeSettlementType == 'Burn') {
    // Burn - burn shares of investor
    let investor = ensureAccount(event.params.payer, event);
    let investment = ensureInvestment(investor, vault, event);

    let burned = new FeeSharesBurnedEvent(uniqueEventId(event));
    burned.vault = vault.id;
    burned.investor = investor.id;
    burned.investment = investment.id;
    burned.type = 'FeeSharesBurned';
    burned.timestamp = event.block.timestamp;
    burned.shares = shares;
    burned.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    burned.save();
  } else if (feeSettlementType == 'MintSharesOutstanding') {
    // MintSharesOutstanding - Allocate fee shares (vault is temporary owner)
    let investor = ensureAccount(event.params.payee, event);
    let investment = ensureInvestment(investor, vault, event);

    let allocated = new FeeSharesAllocationChangedEvent(uniqueEventId(event));
    allocated.vault = vault.id;
    allocated.investor = investor.id;
    allocated.investment = investment.id;
    allocated.type = 'FeeSharesAllocationChanged';
    allocated.timestamp = event.block.timestamp;
    allocated.shares = shares;
    allocated.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    allocated.save();
  } else if (feeSettlementType == 'BurnSharesOutstanding') {
    // BurnSharesOutstanding - Remove allocated fee shares (from vault as temporary owner)
    let investor = ensureAccount(event.params.payee, event);
    let investment = ensureInvestment(investor, vault, event);

    let allocated = new FeeSharesAllocationChangedEvent(uniqueEventId(event));
    allocated.vault = vault.id;
    allocated.investor = investor.id;
    allocated.investment = investment.id;
    allocated.type = 'FeeSharesAllocationChanged';
    allocated.timestamp = event.block.timestamp;
    allocated.shares = BigDecimal.fromString('0').minus(shares);
    allocated.fee = feeId(event.params.comptrollerProxy, event.params.fee);
    allocated.save();
  }
}

export function handleAllSharesOutstandingForcePaidForFund(event: AllSharesOutstandingForcePaidForFund): void {
  let comptrollerProxy = ensureComptroller(event.params.comptrollerProxy, event);
  if (comptrollerProxy.vault == null) {
    return;
  }

  let vault = useVault(comptrollerProxy.vault);
  let investor = ensureAccount(event.params.payee, event);
  let shares = toBigDecimal(event.params.sharesDue);
  let investment = ensureInvestment(investor, vault, event);

  let paidOut = new FeeSharesReceivedEvent(uniqueEventId(event));
  paidOut.vault = vault.id;
  paidOut.investor = investor.id;
  paidOut.investment = investment.id;
  paidOut.type = 'FeeSharesReceived';
  paidOut.timestamp = event.block.timestamp;
  paidOut.shares = shares;
  paidOut.fee = null;
  paidOut.save();
}

export function handleSharesOutstandingPaidForFund(event: SharesOutstandingPaidForFund): void {
  let comptrollerProxy = ensureComptroller(event.params.comptrollerProxy, event);
  if (comptrollerProxy.vault == null) {
    return;
  }

  let vault = useVault(comptrollerProxy.vault);
  let investor = ensureAccount(Address.fromString(vault.owner), event);
  let shares = toBigDecimal(event.params.sharesDue);
  let investment = ensureInvestment(investor, vault, event);

  let paidOut = new FeeSharesReceivedEvent(uniqueEventId(event));
  paidOut.vault = vault.id;
  paidOut.investor = investor.id;
  paidOut.investment = investment.id;
  paidOut.type = 'FeeSharesReceived';
  paidOut.timestamp = event.block.timestamp;
  paidOut.shares = shares;
  paidOut.fee = feeId(event.params.comptrollerProxy, event.params.fee);
  paidOut.save();
}

export function handleFeeDeregistered(event: FeeDeregistered): void {}
export function handleFeeRegistered(event: FeeRegistered): void {}
export function handleFeesRecipientSetForFund(event: FeesRecipientSetForFund): void {}
