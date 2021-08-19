import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureAccount } from '../../entities/Account';
import { ensureExitRateDirectFee } from '../../entities/ExitRateDirectFee';
import { FundSettingsAdded, RecipientSetForFund, Settled } from '../../generated/ExitRateDirectFee4Contract';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureExitRateDirectFee(event.params.comptrollerProxy, event.address, event);
  fee.inKindRate = toBigDecimal(event.params.inKindRate, 5);
  fee.specificAssetsRate = toBigDecimal(event.params.specificAssetsRate, 5);
  fee.save();
}

export function handleRecipientSetForFund(event: RecipientSetForFund): void {
  let recipient = ensureAccount(event.params.recipient, event);

  let fee = ensureExitRateDirectFee(event.params.comptrollerProxy, event.address, event);
  fee.recipient = recipient.id;
  fee.save();
}

export function handleSettled(event: Settled): void {
  let fee = ensureExitRateDirectFee(event.params.comptrollerProxy, event.address, event);
  fee.lastSettled = event.block.timestamp.toI32();
  fee.save();
}
