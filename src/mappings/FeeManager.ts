import { Address } from '@graphprotocol/graph-ts';
import { ensureInvestor, useManager } from '../entities/Account';
import { trackFundCalculations } from '../entities/Calculations';
import { ensureContract } from '../entities/Contract';
import { ensureFee, useFee } from '../entities/Fee';
import { trackFeeState } from '../entities/FeeState';
import { useFund } from '../entities/Fund';
import { ensureInvestment } from '../entities/Investment';
import { trackFundShares } from '../entities/Shares';
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
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { getFeeHook } from '../utils/getFeeHook';
import { getSettlementType } from '../utils/getSettlementType';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAllSharesOutstandingForcePaidForFund(event: AllSharesOutstandingForcePaidForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);

  let fund = useFund(comptroller.getVaultProxy().toHex());
  let investor = ensureInvestor(Address.fromString(fund.manager), event);
  let investment = ensureInvestment(investor, fund);
  let shares = toBigDecimal(event.params.sharesDue);

  let settled = new AllSharesOutstandingForcePaidForFundEvent(genericId(event));
  settled.contract = event.address.toHex();
  settled.fund = fund.id;
  settled.account = useManager(event.transaction.from.toHex()).id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.investment = investment.id;
  settled.shares = shares;
  settled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  settled.payee = event.params.payee.toHex();
  settled.sharesDue = shares;
  settled.save();

  trackFundShares(fund, event, settled);
  // TODO: what do we need to do for fees here (if anything)?
  // trackFeeState(fund, fee, event, settled);
  trackFundCalculations(fund, event, settled);
}

export function handleFeeDeregistered(event: FeeDeregistered): void {
  let deregistration = new FeeDeregisteredEvent(genericId(event));
  deregistration.contract = ensureContract(event.address, 'FeeManager').id;
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.fee = useFee(event.params.fee.toHex()).id;
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.save();
}

export function handleFeeRegistered(event: FeeRegistered): void {
  let registered = new FeeRegisteredEvent(genericId(event));
  registered.contract = ensureContract(event.address, 'FeeManager').id;
  registered.timestamp = event.block.timestamp;
  registered.transaction = ensureTransaction(event).id;
  registered.fee = ensureFee(event.params.fee).id;
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
  let fee = useFee(event.params.fee.toHex());

  let enabled = new FeeEnabledForFundEvent(genericId(event));
  enabled.fund = fundId;
  enabled.contract = ensureContract(event.address, 'FeeManager').id;
  enabled.account = useManager(event.transaction.from.toHex()).id;
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.fee = fee.id;
  enabled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  enabled.settingsData = event.params.settingsData;
  enabled.save();

  fee.funds = arrayUnique<string>(fee.funds.concat([fundId]));
  fee.save();
}

export function handleFeeSettledForFund(event: FeeSettledForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);

  let fund = useFund(comptroller.getVaultProxy().toHex());
  let investor = ensureInvestor(Address.fromString(fund.manager), event);
  let investment = ensureInvestment(investor, fund);
  let fee = useFee(event.params.fee.toHex());
  let shares = toBigDecimal(event.params.sharesDue);

  let settled = new FeeSettledForFundEvent(genericId(event));
  settled.contract = event.address.toHex();
  settled.fund = fund.id;
  settled.account = useManager(event.transaction.from.toHex()).id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.investment = investment.id;
  settled.shares = shares;
  settled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  settled.fee = fee.id;
  settled.payer = event.params.payer.toHex();
  settled.payee = event.params.payee.toHex();
  settled.settlementType = getSettlementType(event.params.settlementType);
  settled.sharesDue = shares;
  settled.save();

  trackFundShares(fund, event, settled);
  trackFeeState(fund, fee, event, settled);
  trackFundCalculations(fund, event, settled);
}

export function handleSharesOutstandingPaidForFund(event: SharesOutstandingPaidForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());
  let investor = ensureInvestor(Address.fromString(fund.manager), event);
  let investment = ensureInvestment(investor, fund);
  let fee = useFee(event.params.fee.toHex());
  let shares = toBigDecimal(event.params.sharesDue);

  let sharesPaid = new SharesOutstandingPaidForFundEvent(genericId(event));
  sharesPaid.contract = event.address.toHex();
  sharesPaid.fund = fund.id;
  sharesPaid.account = useManager(event.transaction.from.toHex()).id;
  sharesPaid.timestamp = event.block.timestamp;
  sharesPaid.transaction = ensureTransaction(event).id;
  sharesPaid.investment = investment.id;
  sharesPaid.shares = shares;
  sharesPaid.comptrollerProxy = event.params.comptrollerProxy.toHex();
  sharesPaid.fee = fee.id;
  sharesPaid.payer = fund.id;
  sharesPaid.sharesDue = toBigDecimal(event.params.sharesDue);
  sharesPaid.payee = useManager(fund.manager).id;
  sharesPaid.save();

  trackFundShares(fund, event, sharesPaid);
  trackFeeState(fund, fee, event, sharesPaid);
  trackFundCalculations(fund, event, sharesPaid);
}

export function handleFeesRecipientSetForFund(event: FeesRecipientSetForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultProxy = comptroller.getVaultProxy().toHex();

  let feeRecipientSet = new FeesRecipientSetForFundEvent(genericId(event));
  feeRecipientSet.contract = ensureContract(event.address, 'FeeManager').id;
  feeRecipientSet.fund = vaultProxy;
  feeRecipientSet.account = useManager(event.transaction.from.toHex()).id;
  feeRecipientSet.timestamp = event.block.timestamp;
  feeRecipientSet.transaction = ensureTransaction(event).id;
  feeRecipientSet.comptrollerProxy = event.params.comptrollerProxy.toHex();
  feeRecipientSet.prevFeesRecipient = event.params.prevFeesRecipient.toHex();
  feeRecipientSet.nextFeesRecipient = event.params.nextFeesRecipient.toHex();
  feeRecipientSet.save();
}
