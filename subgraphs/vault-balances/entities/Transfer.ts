import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Transfer } from '../generated/contracts/AssetEvents';
import { Asset, Vault, IncomingTransfer, OutgoingTransfer } from '../generated/schema';
import { updateVaultBalance } from './Balance';
import { getTransferCounter } from './Counter';

function transferId(event: Transfer, suffix: string): string {
  return event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/' + suffix;
}

export function createIncomingTransfer(event: Transfer, asset: Asset, vault: Vault): void {
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

export function createOutgoingTransfer(event: Transfer, asset: Asset, vault: Vault): void {
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
