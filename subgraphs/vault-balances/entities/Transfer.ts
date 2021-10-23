import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { Asset, Vault, IncomingTransfer, OutgoingTransfer } from '../generated/schema';
import { updateVaultBalance } from './Balance';
import { getTransferCounter } from './Counter';

function transferId(event: ethereum.Event, suffix: string): string {
  return event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/' + suffix;
}

export function createIncomingTransfer(
  event: ethereum.Event,
  asset: Asset,
  vault: Vault,
  value: BigInt,
  sender: Address,
): void {
  let balance = updateVaultBalance(vault, asset, event);
  let amount = toBigDecimal(value, asset.decimals);

  let transfer = new IncomingTransfer(transferId(event, 'incoming'));
  transfer.counter = getTransferCounter();
  transfer.type = 'INCOMING';
  transfer.vault = vault.id;
  transfer.asset = asset.id;
  transfer.balance = balance.id;
  transfer.amount = amount;
  transfer.sender = sender;
  transfer.transaction = event.transaction.hash;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.block = event.block.number.toI32();
  transfer.save();
}

export function createOutgoingTransfer(
  event: ethereum.Event,
  asset: Asset,
  vault: Vault,
  value: BigInt,
  recipient: Address,
): void {
  let balance = updateVaultBalance(vault, asset, event);
  let amount = toBigDecimal(value, asset.decimals);

  let transfer = new OutgoingTransfer(transferId(event, 'outgoing'));
  transfer.counter = getTransferCounter();
  transfer.type = 'OUTGOING';
  transfer.vault = vault.id;
  transfer.asset = asset.id;
  transfer.balance = balance.id;
  transfer.amount = amount;
  transfer.recipient = recipient;
  transfer.transaction = event.transaction.hash;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.block = event.block.number.toI32();
  transfer.save();
}
