import { useManager } from '../entities/Account';
import { ensureComptroller, useComptroller } from '../entities/Comptroller';
import { ensureContract } from '../entities/Contract';
import { ensureFee, useFee } from '../entities/Fee';
import { useFund } from '../entities/Fund';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import {
  FeeDeregistered,
  FeeEnabledForFund,
  FeeRegistered,
  FeeSettledForFund,
  FeeSharesOutstandingPaidForFund,
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
  let id = genericId(event);
  let registered = new FeeRegisteredEvent(id);

  registered.contract = ensureContract(event.address, 'FeeManager', event).id;
  registered.timestamp = event.block.timestamp;
  registered.transaction = ensureTransaction(event).id;
  registered.fee = ensureFee(event.params.fee).id;

  registered.save();
}

export function handleFeeDeregistered(event: FeeDeregistered): void {
  let id = genericId(event);
  let deregistration = new FeeDeregisteredEvent(id);

  deregistration.contract = ensureContract(event.address, 'FeeManager', event).id;
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.fee = useFee(event.params.fee.toHex()).id;

  deregistration.save();
}

export function handleFeeEnabledForFund(event: FeeEnabledForFund): void {
  let id = genericId(event);
  let enabled = new FeeEnabledForFundEvent(id);
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());
  let fee = useFee(event.params.fee.toHex());

  enabled.fund = fund.id;
  enabled.contract = ensureContract(event.address, 'FeeManager', event).id;
  enabled.account = useManager(event.transaction.from.toHex()).id;
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.fee = fee.id;
  enabled.comptrollerProxy = ensureComptroller(event.params.comptrollerProxy).id;
  enabled.settingsData = event.params.settingsData;
  enabled.save();

  fee.funds = arrayUnique<string>(fee.funds.concat([fund.id]))
  fee.save()

  fund.fees = arrayUnique<string>(fund.fees.concat([fee.id]));
  fund.save()
}

export function handleFeeSettledForFund(event: FeeSettledForFund): void {
  let id = genericId(event);
  let settled = new FeeSettledForFundEvent(id);
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());

  settled.contract = ensureContract(event.address, 'FeeManager', event).id;
  settled.fund = fund.id;
  settled.account = useManager(event.transaction.from.toHex()).id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.comptrollerProxy = useComptroller(event.params.comptrollerProxy.toHex()).id;
  settled.fee = useFee(event.params.fee.toHex()).id;
  settled.payer = fund.id;
  settled.sharesDue = toBigDecimal(event.params.sharesDue);
  settled.payee = useManager(fund.manager).id;

  settled.save();
}

export function handleFeeSharesOutstandingPaidForFund(event: FeeSharesOutstandingPaidForFund): void {
  let id = genericId(event);
  let sharesPaid = new FeeSharesOutstandingPaidForFundEvent(id);
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());

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
