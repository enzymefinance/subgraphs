import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { ensureAccount } from '../../entities/Account';
import { ensureAsset } from '../../entities/Asset';
import { ensureComptroller } from '../../entities/Comptroller';
import { ensurePerformanceFee } from '../../entities/PerformanceFee';
import { ComptrollerLib4Contract } from '../../generated/ComptrollerLib4Contract';
import {
  ActivatedForFund,
  FundSettingsAdded,
  LastSharePriceUpdated,
  PaidOut,
  PerformanceUpdated,
  RecipientSetForFund,
} from '../../generated/PerformanceFee4Contract';

export function handleActivatedForFund(event: ActivatedForFund): void {
  let comptroller = ComptrollerLib4Contract.bind(event.params.comptrollerProxy);
  let denominationAsset = ensureAsset(comptroller.getDenominationAsset());

  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, event);
  fee.activatedAt = event.block.timestamp.toI32();
  fee.highWaterMark = toBigDecimal(event.params.highWaterMark, denominationAsset.decimals);
  fee.save();
}

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, event);
  fee.rate = toBigDecimal(event.params.rate, 5);
  fee.period = event.params.period.toI32();
  fee.save();
}

export function handleLastSharePriceUpdated(event: LastSharePriceUpdated): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, event);
  fee.lastSharePrice = toBigDecimal(event.params.nextSharePrice, denominationAsset.decimals);
  fee.save();
}

export function handlePaidOut(event: PaidOut): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, event);
  fee.highWaterMark = toBigDecimal(event.params.nextHighWaterMark, denominationAsset.decimals);
  // AggregateValueDue is not emitted, but it is always set to zero in the protocol just before the event is emitted
  fee.aggregateValueDue = BigDecimal.fromString('0');
  fee.lastPaid = event.block.timestamp.toI32();
  fee.save();
}

export function handlePerformanceUpdated(event: PerformanceUpdated): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, event);
  fee.aggregateValueDue = toBigDecimal(event.params.nextAggregateValueDue, denominationAsset.decimals);
  fee.sharesOutstanding = fee.sharesOutstanding.plus(toBigDecimal(event.params.sharesOutstandingDiff));
  fee.save();
}

export function handleRecipientSetForFund(event: RecipientSetForFund): void {
  let recipient = ensureAccount(event.params.recipient, event);

  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, event);
  fee.recipient = recipient.id;
  fee.save();
}
