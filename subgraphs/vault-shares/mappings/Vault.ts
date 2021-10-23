import { toBigDecimal, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Transfer } from '../generated/contracts/VaultEvents';
import { Depositor, IncomingTransfer, OutgoingTransfer, Vault } from '../generated/schema';
import { getOrCreateDeposit } from '../entities/Deposit';
import { getTransferCounter } from '../entities/Counter';
import { getOrCreateDepositor } from '../entities/Depositor';
import { getOrCreateVault } from '../entities/Vault';
import { BigDecimal } from '@graphprotocol/graph-ts';
import { recordDepositMetric } from '../entities/DepositMetric';

export function transferId(event: Transfer, suffix: string): string {
  return event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/' + suffix;
}

export function handleTransfer(event: Transfer): void {
  // Ignore events where the transfer value is zero.
  if (event.params.value.isZero()) {
    return;
  }

  let vault = getOrCreateVault(event.address);
  let amount = toBigDecimal(event.params.value);

  // If the to or from address is the zero adress, we can skip the loading attempt. This
  // is the case if it's a burn or mint operation for instance.
  let to: Depositor | null = event.params.to.equals(ZERO_ADDRESS) ? null : getOrCreateDepositor(event.params.to);
  let from: Depositor | null = event.params.from.equals(ZERO_ADDRESS) ? null : getOrCreateDepositor(event.params.from);

  // Adjust the total supply of the vault if this was a token mint or burn event.
  if (from == null && to != null) {
    vault.supply = vault.supply.plus(amount);
  } else if (to == null && from != null) {
    vault.supply = vault.supply.minus(amount);
  }

  // Record the case where the recipient is a vault.
  if (to != null) {
    handleIncomingTransfer(event, amount, vault, to, from);
  }

  // Record the case where the sender is a vault.
  if (from != null) {
    handleOutgoingTransfer(event, amount, vault, from, to);
  }
}

function handleIncomingTransfer(
  event: Transfer,
  amount: BigDecimal,
  vault: Vault,
  depositor: Depositor,
  from: Depositor | null,
): void {
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
  transfer.sender = from == null ? null : from.id;
  transfer.transaction = event.transaction.hash;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.block = event.block.number.toI32();
  transfer.save();

  recordDepositMetric(vault, depositor, deposit, event);
}

function handleOutgoingTransfer(
  event: Transfer,
  amount: BigDecimal,
  vault: Vault,
  depositor: Depositor,
  to: Depositor | null,
): void {
  let deposit = getOrCreateDeposit(vault, depositor, event);
  deposit.balance = deposit.balance.minus(amount);

  let transfer = new OutgoingTransfer(transferId(event, 'outgoing'));
  transfer.counter = getTransferCounter();
  transfer.type = 'OUTGOING';
  transfer.supply = vault.supply;
  transfer.vault = vault.id;
  transfer.depositor = depositor.id;
  transfer.deposit = deposit.id;
  transfer.amount = amount;
  transfer.recipient = to == null ? null : to.id;
  transfer.transaction = event.transaction.hash;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.block = event.block.number.toI32();
  transfer.save();

  recordDepositMetric(vault, depositor, deposit, event);
}
