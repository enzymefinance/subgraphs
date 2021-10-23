import { BigDecimal } from '@graphprotocol/graph-ts';
import { Transfer } from '../generated/contracts/VaultEvents';
import { Vault, Depositor, IncomingTransfer, OutgoingTransfer } from '../generated/schema';
import { getTransferCounter } from './Counter';
import { getOrCreateDeposit } from './Deposit';
import { recordDepositMetric } from './DepositMetric';

function transferId(event: Transfer, suffix: string): string {
  return event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/' + suffix;
}

export function createIncomingTransfer(
  event: Transfer,
  amount: BigDecimal,
  vault: Vault,
  depositor: Depositor,
  from: Depositor | null,
): void {
  let deposit = getOrCreateDeposit(vault, depositor);
  deposit.balance = deposit.balance.plus(amount);
  deposit.save();

  recordDepositMetric(vault, depositor, deposit, event);

  let transfer = new IncomingTransfer(transferId(event, 'incoming'));
  transfer.counter = getTransferCounter();
  transfer.type = 'INCOMING';
  transfer.supply = vault.supply;
  transfer.vault = vault.id;
  transfer.depositor = depositor.id;
  transfer.deposit = deposit.id;
  transfer.amount = amount;
  transfer.balance = deposit.balance;
  transfer.sender = from == null ? null : from.id;
  transfer.transaction = event.transaction.hash;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.block = event.block.number.toI32();
  transfer.save();
}

export function createOutgoingTransfer(
  event: Transfer,
  amount: BigDecimal,
  vault: Vault,
  depositor: Depositor,
  to: Depositor | null,
): void {
  let deposit = getOrCreateDeposit(vault, depositor);
  deposit.balance = deposit.balance.minus(amount);
  deposit.save();

  recordDepositMetric(vault, depositor, deposit, event);

  let transfer = new OutgoingTransfer(transferId(event, 'outgoing'));
  transfer.counter = getTransferCounter();
  transfer.type = 'OUTGOING';
  transfer.supply = vault.supply;
  transfer.vault = vault.id;
  transfer.depositor = depositor.id;
  transfer.deposit = deposit.id;
  transfer.amount = amount;
  transfer.balance = deposit.balance;
  transfer.recipient = to == null ? null : to.id;
  transfer.transaction = event.transaction.hash;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.block = event.block.number.toI32();
  transfer.save();
}
