import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Deposit, Withdraw } from '../generated/contracts/SavingsDaiEvents';
import { Vault } from '../generated/schema';
import { getOrCreateAsset } from '../entities/Asset';
import { createIncomingTransfer, createOutgoingTransfer } from '../entities/Transfer';

export function handleDeposit(event: Deposit): void {
  // Ignore events where the transfer value is zero.
  if (event.params.shares.isZero()) {
    return;
  }

  // If the to address is the zero adress, we can skip the loading attempt. This
  // is the case if it's a mint operation for instance.
  let to: Vault | null = event.params.owner.equals(ZERO_ADDRESS) ? null : Vault.load(event.params.owner.toHex());

  // Bail out early if `to` is not a vault.
  // NOTE: There is a possibility, that a token is transferred to a future vault address
  // before it is even created. We knowingly ignore this case here.
  if (to == null) {
    return;
  }

  // Ensure that this is a valid asset.
  let asset = getOrCreateAsset(event.address);
  if (asset == null) {
    return;
  }

  // Record the case where the recipient is a vault.
  if (to != null) {
    createIncomingTransfer(event, asset, to, event.params.shares, event.params.sender);
  }
}

export function handleWithdraw(event: Withdraw): void {
  // Ignore events where the transfer value is zero.
  if (event.params.shares.isZero()) {
    return;
  }

  // If the to or from address is the zero adress, we can skip the loading attempt. This
  // is the case if it's a burn or mint operation for instance.
  let from: Vault | null = event.params.sender.equals(ZERO_ADDRESS) ? null : Vault.load(event.params.sender.toHex());

  // Bail out early if `from` is not a vault.
  if (from == null) {
    return;
  }

  // Ensure that this is a valid asset.
  let asset = getOrCreateAsset(event.address);
  if (asset == null) {
    return;
  }

  // Record the case where the sender is a vault.
  if (from != null) {
    createOutgoingTransfer(event, asset, from, event.params.shares, event.params.owner);
  }
}
