import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Transfer } from '../generated/contracts/AssetEvents';
import { getOrCreateAsset } from '../entities/Asset';
import { Vault } from '../generated/schema';
import { createIncomingTransfer, createOutgoingTransfer } from '../entities/Transfer';

export function handleTransfer(event: Transfer): void {
  // Ignore events where the transfer value is zero.
  if (event.params.value.isZero()) {
    return;
  }

  // Ignore fee share transfers. They are first minted for the vault itself (first case) and
  // then transferred to the manager when they are claimed (second case).
  // NOTE: If we ever want to support a fund buying shares of itself (apparently that's
  // a thing in TradFi), then we have to reconsider this.
  if (event.params.to.equals(event.address) || event.params.from.equals(event.address)) {
    return;
  }

  // If the to or from address is the zero adress, we can skip the loading attempt. This
  // is the case if it's a burn or mint operation for instance.
  let to: Vault | null = event.params.to.equals(ZERO_ADDRESS) ? null : Vault.load(event.params.to.toHex());
  let from: Vault | null = event.params.from.equals(ZERO_ADDRESS) ? null : Vault.load(event.params.from.toHex());

  // Bail out early if neither `from` nor `to` are a vault.
  // NOTE: There is a possibility, that a token is transferred to a future vault address
  // before it is even created. We knowingly ignore this case here.
  if (to == null && from == null) {
    return;
  }

  // Ensure that this is a valid asset.
  let asset = getOrCreateAsset(event.address);
  if (asset == null) {
    return;
  }

  // Record the case where the recipient is a vault.
  if (to != null) {
    createIncomingTransfer(event, asset, to, event.params.value, event.params.from);
  }

  // Record the case where the sender is a vault.
  if (from != null) {
    createOutgoingTransfer(event, asset, from, event.params.value, event.params.to);
  }
}
