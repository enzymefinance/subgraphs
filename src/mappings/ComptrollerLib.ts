import {
  AmguPaid,
  FundStatusUpdated,
  CallOnIntegrationExecuted,
  SharesBought,
  SharesRedeemed,
  VaultProxySet,
} from '../generated/ComptrollerLibContract';

export function handleAmguPaid(event: AmguPaid): void {}
export function handleCallOnIntegrationExecuted(
  event: CallOnIntegrationExecuted,
): void {}
export function handleFundStatusUpdated(event: FundStatusUpdated): void {}
export function handleSharesBought(event: SharesBought): void {}
export function handleSharesRedeemed(event: SharesRedeemed): void {}
export function handleVaultProxySet(event: VaultProxySet): void {}
