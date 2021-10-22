import { toBigDecimal, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Transfer } from '../generated/contracts/ERC20Events';
import { Asset, IncomingTransfer, OutgoingTransfer, Vault } from '../generated/schema';
import { getOrCreateAsset } from '../entities/Asset';
import { updateVaultBalance } from '../entities/Balance';
import { getTransferCounter } from '../entities/Counter';

export function transferId(event: Transfer, suffix: string): string {
  return event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/' + suffix;
}

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
    handleIncomingTransfer(event, asset, to);
  }

  // Record the case where the sender is a vault.
  if (from != null) {
    handleOutgoingTransfer(event, asset, from);
  }
}

function handleIncomingTransfer(event: Transfer, asset: Asset, vault: Vault): void {
  let balance = updateVaultBalance(vault, asset, event);
  let amount = toBigDecimal(event.params.value, asset.decimals);

  let transfer = new IncomingTransfer(transferId(event, 'incoming'));
  transfer.counter = getTransferCounter();
  transfer.type = 'INCOMING';
  transfer.vault = vault.id;
  transfer.asset = asset.id;
  transfer.balance = balance.id;
  transfer.amount = amount;
  transfer.sender = event.params.from;
  transfer.transaction = event.transaction.hash;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.block = event.block.number.toI32();
  transfer.save();
}

function handleOutgoingTransfer(event: Transfer, asset: Asset, vault: Vault): void {
  let balance = updateVaultBalance(vault, asset, event);
  let amount = toBigDecimal(event.params.value, asset.decimals);

  let transfer = new OutgoingTransfer(transferId(event, 'outgoing'));
  transfer.counter = getTransferCounter();
  transfer.type = 'OUTGOING';
  transfer.vault = vault.id;
  transfer.asset = asset.id;
  transfer.balance = balance.id;
  transfer.amount = amount;
  transfer.recipient = event.params.to;
  transfer.transaction = event.transaction.hash;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.block = event.block.number.toI32();
  transfer.save();
}
