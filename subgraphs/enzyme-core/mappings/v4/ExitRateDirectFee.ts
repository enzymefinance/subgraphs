import { toBigDecimal, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { ensureAccount } from '../../entities/Account';
import { ensureExitRateDirectFee } from '../../entities/ExitRateDirectFee';
import { linkSharesSplitterToVault } from '../../entities/SharesSplitter';
import { FundSettingsAdded, RecipientSetForFund, Settled } from '../../generated/contracts/ExitRateDirectFee4Events';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureExitRateDirectFee(event.params.comptrollerProxy, event.address, event);
  fee.inKindRate = toBigDecimal(event.params.inKindRate, 4);
  fee.specificAssetsRate = toBigDecimal(event.params.specificAssetsRate, 4);
  fee.save();
}

export function handleRecipientSetForFund(event: RecipientSetForFund): void {
  let fee = ensureExitRateDirectFee(event.params.comptrollerProxy, event.address, event);
  if (event.params.recipient.equals(ZERO_ADDRESS)) {
    fee.recipient = null;
  } else {
    let recipient = ensureAccount(event.params.recipient, event);
    fee.recipient = recipient.id;
    linkSharesSplitterToVault(recipient, event.params.comptrollerProxy);
  }
  fee.save();
}

export function handleSettled(event: Settled): void {
  let fee = ensureExitRateDirectFee(event.params.comptrollerProxy, event.address, event);
  fee.lastSettled = event.block.timestamp.toI32();
  fee.save();
}
