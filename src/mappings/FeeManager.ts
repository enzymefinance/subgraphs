import { Address } from '@graphprotocol/graph-ts';
import { ensureInvestor, useManager } from '../entities/Account';
import { ensureComptroller, useComptroller } from '../entities/Comptroller';
import { ensureContract } from '../entities/Contract';
import { ensureFee, useFee } from '../entities/Fee';
import { useFund } from '../entities/Fund';
import { ensureInvestment } from '../entities/Investment';
import { trackFundShares } from '../entities/Shares';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import {
  FeeDeregistered,
  FeeEnabledForFund,
  FeeRegistered,
  FeeSettledForFund,
  SharesOutstandingPaidForFee,
} from '../generated/FeeManagerContract';
import {
  FeeDeregisteredEvent,
  FeeEnabledForFundEvent,
  FeeRegisteredEvent,
  FeeSettledForFundEvent,
  FeeSharesOutstandingPaidForFundEvent,
} from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/tokenValue';

export function handleFeeRegistered(event: FeeRegistered): void {
  let registered = new FeeRegisteredEvent(genericId(event));
  registered.contract = ensureContract(event.address, 'FeeManager', event).id;
  registered.timestamp = event.block.timestamp;
  registered.transaction = ensureTransaction(event).id;
  registered.fee = ensureFee(event.params.fee).id;
  registered.identifier = event.params.identifier.toHex();
  registered.save();
}

export function handleFeeDeregistered(event: FeeDeregistered): void {
  let deregistration = new FeeDeregisteredEvent(genericId(event));
  deregistration.contract = ensureContract(event.address, 'FeeManager', event).id;
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.fee = useFee(event.params.fee.toHex()).id;
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.save();
}

export function handleFeeEnabledForFund(event: FeeEnabledForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fundId = comptroller.getVaultProxy().toHex();
  let fee = useFee(event.params.fee.toHex());

  let enabled = new FeeEnabledForFundEvent(genericId(event));
  enabled.fund = fundId;
  enabled.contract = ensureContract(event.address, 'FeeManager', event).id;
  enabled.account = useManager(event.transaction.from.toHex()).id;
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.fee = fee.id;
  enabled.comptrollerProxy = ensureComptroller(event.params.comptrollerProxy).id;
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

  let settled = new FeeSettledForFundEvent(genericId(event));
  settled.contract = ensureContract(event.address, 'FeeManager', event).id;
  settled.fund = fund.id;
  settled.account = useManager(event.transaction.from.toHex()).id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.investment = investment.id;
  settled.shares = toBigDecimal(event.params.sharesDue);
  settled.comptrollerProxy = useComptroller(event.params.comptrollerProxy.toHex()).id;
  settled.fee = useFee(event.params.fee.toHex()).id;
  settled.payer = fund.id;
  settled.sharesDue = toBigDecimal(event.params.sharesDue);
  settled.payee = useManager(fund.manager).id;
  settled.save();

  trackFundShares(fund, event, settled);
}

export function handleSharesOutstandingPaidForFee(event: SharesOutstandingPaidForFee): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());

  let sharesPaid = new FeeSharesOutstandingPaidForFundEvent(genericId(event));
  sharesPaid.contract = ensureContract(event.address, 'FeeManager', event).id;
  sharesPaid.fund = fund.id;
  sharesPaid.account = useManager(event.transaction.from.toHex()).id;
  sharesPaid.timestamp = event.block.timestamp;
  sharesPaid.transaction = ensureTransaction(event).id;
  sharesPaid.comptrollerProxy = useComptroller(event.params.comptrollerProxy.toHex()).id;
  sharesPaid.fee = useFee(event.params.fee.toHex()).id;
  sharesPaid.payer = fund.id;
  sharesPaid.sharesDue = toBigDecimal(event.params.sharesDue);
  sharesPaid.payee = useManager(fund.manager).id;
  sharesPaid.save();
}
