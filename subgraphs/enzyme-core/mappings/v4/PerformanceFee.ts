import { toBigDecimal, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { ensureAccount } from '../../entities/Account';
import { ensureAsset } from '../../entities/Asset';
import { ensurePerformanceFee } from '../../entities/PerformanceFee';
import { linkSharesSplitterToVault } from '../../entities/SharesSplitter';
import {
  ActivatedForFund,
  FundSettingsAdded,
  HighWaterMarkUpdated,
  RecipientSetForFund,
  Settled,
} from '../../generated/contracts/PerformanceFee4Events';
import { ProtocolSdk } from '../../generated/contracts/ProtocolSdk';

export function handleActivatedForFund(event: ActivatedForFund): void {
  let comptroller = ProtocolSdk.bind(event.params.comptrollerProxy);
  let denominationAsset = ensureAsset(comptroller.getDenominationAsset());

  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, 'NO_CRYSTALLIZATION_PERIOD', event);
  fee.activatedAt = event.block.timestamp.toI32();
  fee.highWaterMark = toBigDecimal(event.params.highWaterMark, denominationAsset.decimals);
  fee.save();
}

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, 'NO_CRYSTALLIZATION_PERIOD', event);
  fee.rate = toBigDecimal(event.params.rate, 4);
  fee.save();
}

export function handleRecipientSetForFund(event: RecipientSetForFund): void {
  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, 'NO_CRYSTALLIZATION_PERIOD', event);
  if (event.params.recipient.equals(ZERO_ADDRESS)) {
    fee.recipient = null;
  } else {
    let recipient = ensureAccount(event.params.recipient, event);
    fee.recipient = recipient.id;
    linkSharesSplitterToVault(recipient, event.params.comptrollerProxy);
  }
  fee.save();
}

export function handleHighWaterMarkUpdated(event: HighWaterMarkUpdated): void {
  let comptroller = ProtocolSdk.bind(event.params.comptrollerProxy);
  let denominationAsset = ensureAsset(comptroller.getDenominationAsset());

  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, 'NO_CRYSTALLIZATION_PERIOD', event);
  fee.activatedAt = event.block.timestamp.toI32();
  fee.highWaterMark = toBigDecimal(event.params.nextHighWaterMark, denominationAsset.decimals);
  fee.save();
}

export function handleSettled(event: Settled): void {
  let fee = ensurePerformanceFee(event.params.comptrollerProxy, event.address, 'NO_CRYSTALLIZATION_PERIOD', event);
  fee.lastSettled = event.block.timestamp.toI32();
  fee.save();
}
