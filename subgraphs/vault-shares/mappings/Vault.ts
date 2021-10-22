import { toBigDecimal, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Transfer } from '../generated/contracts/VaultEvents';
import { Deposit, Depositor, IncomingTransfer, OutgoingTransfer, Vault } from '../generated/schema';
import { getOrCreateDeposit } from '../entities/Deposit';
import { getTransferCounter } from '../entities/Counter';
import { getOrCreateDepositor } from '../entities/Depositor';
import { getOrCreateVault } from '../entities/Vault';

export function transferId(event: Transfer, suffix: string): string {
  return event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/' + suffix;
}

export function handleTransfer(event: Transfer): void {
  // Ignore events where the transfer value is zero.
  if (event.params.value.isZero()) {
    return;
  }

  // If the to or from address is the zero adress, we can skip the loading attempt. This
  // is the case if it's a burn or mint operation for instance.
  let to: Depositor | null = event.params.to.equals(ZERO_ADDRESS) ? null : getOrCreateDepositor(event.params.to);
  let from: Depositor | null = event.params.from.equals(ZERO_ADDRESS) ? null : getOrCreateDepositor(event.params.from);

  let vault = getOrCreateVault(event.address);

  // Record the case where the recipient is a vault.
  if (to != null) {
    handleIncomingTransfer(event, vault, to);
  }

  // Record the case where the sender is a vault.
  if (from != null) {
    handleOutgoingTransfer(event, vault, from);
  }
}

function handleIncomingTransfer(event: Transfer, vault: Vault, depositor: Depositor): void {
  let amount = toBigDecimal(event.params.value);
  let deposit = getOrCreateDeposit(vault, depositor, event);
  deposit.balance = deposit.balance.plus(amount);

  let transfer = new IncomingTransfer(transferId(event, 'incoming'));
  transfer.counter = getTransferCounter();
  transfer.type = 'INCOMING';
  transfer.supply = vault.supply;
  transfer.vault = vault.id;
  transfer.depositor = depositor.id;
  transfer.deposit = deposit.id;
  transfer.amount = amount;
  transfer.sender = event.params.from;
  transfer.transaction = event.transaction.hash;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.block = event.block.number.toI32();
  transfer.save();
}

function handleOutgoingTransfer(event: Transfer, vault: Vault, depositor: Depositor): void {
  let amount = toBigDecimal(event.params.value);
  let deposit = getOrCreateDeposit(vault, depositor, event);
  deposit.balance = deposit.balance.minus(amount);

  let transfer = new OutgoingTransfer(transferId(event, 'outgoing'));
  transfer.counter = getTransferCounter();
  transfer.type = 'OUTGOING';
  transfer.vault = vault.id;
  transfer.depositor = depositor.id;
  transfer.deposit = deposit.id;
  transfer.amount = amount;
  transfer.recipient = event.params.to;
  transfer.transaction = event.transaction.hash;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.block = event.block.number.toI32();
  transfer.save();
}
