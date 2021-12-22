import { toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureGasRelayer, trackGasRelayerBalance } from '../../entities/GasRelayer';
import { Deposited, TransactionRelayed, Withdrawn } from '../../generated/contracts/GasRelayPaymasterLib4Events';
import { GasRelayerDeposited, GasRelayerTransaction, GasRelayerWithdrawn } from '../../generated/schema';

export function handleDeposited(event: Deposited): void {
  let gasRelayer = ensureGasRelayer(event.address);

  let deposited = new GasRelayerDeposited(uniqueEventId(event));
  deposited.gasRelayer = gasRelayer.id;
  deposited.amount = toBigDecimal(event.params.amount);
  deposited.save();

  trackGasRelayerBalance(event.address);
}

export function handleTransactionRelayed(event: TransactionRelayed): void {
  let gasRelayer = ensureGasRelayer(event.address);

  let transaction = new GasRelayerTransaction(uniqueEventId(event));
  transaction.gasRelayer = gasRelayer.id;
  transaction.authorizer = event.params.authorizer;
  transaction.invokedSelector = event.params.invokedSelector.toHexString();
  transaction.successful = event.params.successful;
  transaction.save();

  trackGasRelayerBalance(event.address);
}

export function handleWithdrawn(event: Withdrawn): void {
  let gasRelayer = ensureGasRelayer(event.address);

  let withdrawn = new GasRelayerWithdrawn(uniqueEventId(event));
  withdrawn.gasRelayer = gasRelayer.id;
  withdrawn.amount = toBigDecimal(event.params.amount);
  withdrawn.save();

  trackGasRelayerBalance(event.address);
}
