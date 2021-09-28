import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { zeroAddress } from '../constants';
import { ensureAccount, ensureInvestor } from '../entities/Account';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { ensureFee } from '../entities/Fee';
import { trackFeeState } from '../entities/FeeState';
import { useFund } from '../entities/Fund';
import { trackInvestmentState } from '../entities/InvestmentState';
import { ensurePerformanceFeeState } from '../entities/PerformanceFeeState';
import { trackShareState } from '../entities/ShareState';
import { ensureTransaction } from '../entities/Transaction';
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
import { genericId } from '../utils/genericId';
import { getFeeHook } from '../utils/getFeeHook';
import { getSettlementType } from '../utils/getSettlementType';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAllSharesOutstandingForcePaidForFund(event: AllSharesOutstandingForcePaidForFund): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.fund == null) {
    return;
  }

  let fund = useFund(comptrollerProxy.fund);
  let investor = ensureAccount(Address.fromString(fund.manager), event);
  let investmentState = trackInvestmentState(investor, fund, event);
  let shares = toBigDecimal(event.params.sharesDue);

  let settled = new AllSharesOutstandingForcePaidForFundEvent(genericId(event));
  settled.fund = fund.id;
  settled.type = 'AllSharesOutstandingForcePaidForFund';
  settled.investor = investor.id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.investmentState = investmentState.id;
  settled.shares = shares;
  settled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  settled.payee = event.params.payee.toHex();
  settled.sharesDue = shares;
  settled.fundState = fund.state;
  settled.save();

  trackShareState(fund, event, settled);

  let vaultAsInvestor = ensureInvestor(Address.fromString(fund.id), event);
  trackInvestmentState(vaultAsInvestor, fund, event);
}

export function handleFeeDeregistered(event: FeeDeregistered): void {
  let deregistration = new FeeDeregisteredEvent(genericId(event));
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.fee = ensureFee(event.params.fee).id;
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.save();
}

export function handleFeeRegistered(event: FeeRegistered): void {
  let fee = ensureFee(event.params.fee);

  let registered = new FeeRegisteredEvent(genericId(event));
  registered.timestamp = event.block.timestamp;
  registered.transaction = ensureTransaction(event).id;
  registered.fee = fee.id;
  registered.identifier = event.params.identifier.toHex();
  registered.implementedHooksForSettle = event.params.implementedHooksForSettle.map<string>((hook) => getFeeHook(hook));
  registered.implementedHooksForUpdate = event.params.implementedHooksForUpdate.map<string>((hook) => getFeeHook(hook));
  registered.usesGavOnSettle = event.params.usesGavOnSettle;
  registered.usesGavOnUpdate = event.params.usesGavOnUpdate;
  registered.save();
}

export function handleFeeEnabledForFund(event: FeeEnabledForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fundId = comptroller.getVaultProxy().toHex();
  let fee = ensureFee(event.params.fee);

  let enabled = new FeeEnabledForFundEvent(genericId(event));
  enabled.fund = fundId;
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.fee = fee.id;
  enabled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  enabled.settingsData = event.params.settingsData;
  enabled.save();
}

export function handleFeeSettledForFund(event: FeeSettledForFund): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.fund == null) {
    return;
  }

  let payer = ensureAccount(event.params.payer, event);
  let payee = ensureAccount(event.params.payee, event);

  let fund = useFund(comptrollerProxy.fund);
  let investor = payer.id != zeroAddress.toHex() ? payer : payee;
  let investmentState = trackInvestmentState(investor, fund, event);
  let fee = ensureFee(event.params.fee);
  let shares = toBigDecimal(event.params.sharesDue);

  let settled = new FeeSettledForFundEvent(genericId(event));
  settled.fund = fund.id;
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
  settled.settlementType = getSettlementType(event.params.settlementType);
  settled.sharesDue = shares;
  settled.fundState = fund.state;
  settled.save();

  trackShareState(fund, event, settled);
  trackFeeState(fund, fee, BigDecimal.fromString('0'), event, settled);
}

export function handleSharesOutstandingPaidForFund(event: SharesOutstandingPaidForFund): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.fund == null) {
    return;
  }

  let fund = useFund(comptrollerProxy.fund);
  let investor = ensureAccount(Address.fromString(fund.manager), event);
  let investmentState = trackInvestmentState(investor, fund, event);
  let fee = ensureFee(event.params.fee);
  let shares = toBigDecimal(event.params.sharesDue);

  let sharesPaid = new SharesOutstandingPaidForFundEvent(genericId(event));
  sharesPaid.fund = fund.id;
  sharesPaid.type = 'SharesOutstandingPaidForFund';
  sharesPaid.investor = investor.id;
  sharesPaid.timestamp = event.block.timestamp;
  sharesPaid.transaction = ensureTransaction(event).id;
  sharesPaid.investmentState = investmentState.id;
  sharesPaid.shares = shares;
  sharesPaid.comptrollerProxy = event.params.comptrollerProxy.toHex();
  sharesPaid.fee = fee.id;
  sharesPaid.sharesDue = toBigDecimal(event.params.sharesDue);
  sharesPaid.fundState = fund.state;
  sharesPaid.save();

  trackShareState(fund, event, sharesPaid);
  trackFeeState(fund, fee, BigDecimal.fromString('0'), event, sharesPaid);

  // we only need to look at Performance Fee here, since it is the only Fee that pays out SharesOutstanding
  if (fee.identifier == 'PERFORMANCE') {
    let performanceFeeState = ensurePerformanceFeeState(fund, fee, event, sharesPaid);
    performanceFeeState.sharesOutstanding = performanceFeeState.sharesOutstanding.minus(shares);
    performanceFeeState.save();
  }

  let vaultAsInvestor = ensureInvestor(Address.fromString(fund.id), event);
  trackInvestmentState(vaultAsInvestor, fund, event);
}

export function handleFeesRecipientSetForFund(event: FeesRecipientSetForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultProxy = comptroller.getVaultProxy().toHex();

  let feeRecipientSet = new FeesRecipientSetForFundEvent(genericId(event));
  feeRecipientSet.fund = vaultProxy;
  feeRecipientSet.timestamp = event.block.timestamp;
  feeRecipientSet.transaction = ensureTransaction(event).id;
  feeRecipientSet.comptrollerProxy = event.params.comptrollerProxy.toHex();
  feeRecipientSet.prevFeesRecipient = event.params.prevFeesRecipient.toHex();
  feeRecipientSet.nextFeesRecipient = event.params.nextFeesRecipient.toHex();
  feeRecipientSet.save();
}
