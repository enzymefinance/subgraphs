import { toBigDecimal, uniqueEventId, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { ensureAccount } from '../entities/Account';
import { calculationStateId, trackCalculationState } from '../entities/CalculationState';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { ensureFee } from '../entities/Fee';
import { trackFeeState } from '../entities/FeeState';
import { trackInvestmentState } from '../entities/InvestmentState';
import { ensurePerformanceFeeState } from '../entities/PerformanceFeeState';
import { trackShareState } from '../entities/ShareState';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import {
  AllSharesOutstandingForcePaidForFund,
  FeeDeregistered,
  FeeEnabledForFund,
  FeeRegistered,
  FeeSettledForFund,
  FeesRecipientSetForFund,
  SharesOutstandingPaidForFund,
} from '../generated/FeeManagerContract';
import {
  AllSharesOutstandingForcePaidForFundEvent,
  FeeDeregisteredEvent,
  FeeEnabledForFundEvent,
  FeeRegisteredEvent,
  FeeSettledForFundEvent,
  FeesRecipientSetForFundEvent,
  SharesOutstandingPaidForFundEvent,
} from '../generated/schema';
import { feeHook } from '../utils/feeHook';
import { settlementType } from '../utils/settlementType';

export function handleAllSharesOutstandingForcePaidForFund(event: AllSharesOutstandingForcePaidForFund): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.vault == null) {
    return;
  }

  let vault = useVault(comptrollerProxy.vault);
  let investor = ensureAccount(Address.fromString(vault.manager), event);
  let investmentState = trackInvestmentState(investor, vault, event);
  let shares = toBigDecimal(event.params.sharesDue);

  let settled = new AllSharesOutstandingForcePaidForFundEvent(uniqueEventId(event));
  settled.vault = vault.id;
  settled.type = 'AllSharesOutstandingForcePaidForFund';
  settled.investor = investor.id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.investmentState = investmentState.id;
  settled.shares = shares;
  settled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  settled.payee = event.params.payee.toHex();
  settled.sharesDue = shares;
  settled.calculations = calculationStateId(vault, event);
  settled.vaultState = vault.state;
  settled.save();

  trackShareState(vault, event, settled);
  // TODO: what do we need to do for fees here (if anything)?
  // trackFeeState(fund, fee, event, settled);
  trackCalculationState(vault, event, settled);
}

export function handleFeeDeregistered(event: FeeDeregistered): void {
  let deregistration = new FeeDeregisteredEvent(uniqueEventId(event));
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.fee = ensureFee(event.params.fee).id;
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.save();
}

export function handleFeeRegistered(event: FeeRegistered): void {
  let fee = ensureFee(event.params.fee);

  let registered = new FeeRegisteredEvent(uniqueEventId(event));
  registered.timestamp = event.block.timestamp;
  registered.transaction = ensureTransaction(event).id;
  registered.fee = fee.id;
  registered.identifier = event.params.identifier.toHex();
  registered.implementedHooksForSettle = event.params.implementedHooksForSettle.map<string>((hook) => feeHook(hook));
  registered.implementedHooksForUpdate = event.params.implementedHooksForUpdate.map<string>((hook) => feeHook(hook));
  registered.usesGavOnSettle = event.params.usesGavOnSettle;
  registered.usesGavOnUpdate = event.params.usesGavOnUpdate;
  registered.save();
}

export function handleFeeEnabledForFund(event: FeeEnabledForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultId = comptroller.getVaultProxy().toHex();
  let fee = ensureFee(event.params.fee);

  let enabled = new FeeEnabledForFundEvent(uniqueEventId(event));
  enabled.vault = vaultId;
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.fee = fee.id;
  enabled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  enabled.settingsData = event.params.settingsData;
  enabled.save();
}

export function handleFeeSettledForFund(event: FeeSettledForFund): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.vault == null) {
    return;
  }

  let payer = ensureAccount(event.params.payer, event);
  let payee = ensureAccount(event.params.payee, event);

  let vault = useVault(comptrollerProxy.vault);
  let investor = payer.id != ZERO_ADDRESS.toHex() ? payer : payee;
  let investmentState = trackInvestmentState(investor, vault, event);
  let fee = ensureFee(event.params.fee);
  let shares = toBigDecimal(event.params.sharesDue);

  let settled = new FeeSettledForFundEvent(uniqueEventId(event));
  settled.vault = vault.id;
  settled.type = 'FeeSettledForFund';
  settled.investor = investor.id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.investmentState = investmentState.id;
  settled.shares = shares;
  settled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  settled.fee = fee.id;
  settled.payer = event.params.payer.toHex();
  settled.payee = event.params.payee.toHex();
  settled.settlementType = settlementType(event.params.settlementType);
  settled.sharesDue = shares;
  settled.calculations = calculationStateId(vault, event);
  settled.vaultState = vault.state;
  settled.save();

  trackShareState(vault, event, settled);
  trackFeeState(vault, fee, BigDecimal.fromString('0'), event, settled);
  trackCalculationState(vault, event, settled);
}

export function handleSharesOutstandingPaidForFund(event: SharesOutstandingPaidForFund): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.vault == null) {
    return;
  }

  let vault = useVault(comptrollerProxy.vault);
  let investor = ensureAccount(Address.fromString(vault.manager), event);
  let investmentState = trackInvestmentState(investor, vault, event);
  let fee = ensureFee(event.params.fee);
  let shares = toBigDecimal(event.params.sharesDue);

  let sharesPaid = new SharesOutstandingPaidForFundEvent(uniqueEventId(event));
  sharesPaid.vault = vault.id;
  sharesPaid.type = 'SharesOutstandingPaidForFund';
  sharesPaid.investor = investor.id;
  sharesPaid.timestamp = event.block.timestamp;
  sharesPaid.transaction = ensureTransaction(event).id;
  sharesPaid.investmentState = investmentState.id;
  sharesPaid.shares = shares;
  sharesPaid.comptrollerProxy = event.params.comptrollerProxy.toHex();
  sharesPaid.fee = fee.id;
  sharesPaid.sharesDue = toBigDecimal(event.params.sharesDue);
  sharesPaid.calculations = calculationStateId(vault, event);
  sharesPaid.vaultState = vault.state;
  sharesPaid.save();

  trackShareState(vault, event, sharesPaid);
  trackFeeState(vault, fee, BigDecimal.fromString('0'), event, sharesPaid);

  // we only need to look at Performance Fee here, since it is the only Fee that pays out SharesOutstanding
  if (fee.identifier == 'PERFORMANCE') {
    let performanceFeeState = ensurePerformanceFeeState(vault, fee, event, sharesPaid);
    performanceFeeState.sharesOutstanding = performanceFeeState.sharesOutstanding.minus(shares);
    performanceFeeState.save();
  }

  trackCalculationState(vault, event, sharesPaid);
}

export function handleFeesRecipientSetForFund(event: FeesRecipientSetForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultProxy = comptroller.getVaultProxy().toHex();

  let feeRecipientSet = new FeesRecipientSetForFundEvent(uniqueEventId(event));
  feeRecipientSet.vault = vaultProxy;
  feeRecipientSet.timestamp = event.block.timestamp;
  feeRecipientSet.transaction = ensureTransaction(event).id;
  feeRecipientSet.comptrollerProxy = event.params.comptrollerProxy.toHex();
  feeRecipientSet.prevFeesRecipient = event.params.prevFeesRecipient.toHex();
  feeRecipientSet.nextFeesRecipient = event.params.nextFeesRecipient.toHex();
  feeRecipientSet.save();
}
