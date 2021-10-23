import { toBigDecimal, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Transfer } from '../generated/contracts/VaultEvents';
import { Depositor } from '../generated/schema';
import { getOrCreateDepositor } from '../entities/Depositor';
import { getOrCreateVault } from '../entities/Vault';
import { createIncomingTransfer, createOutgoingTransfer } from '../entities/Transfer';
import { recordSupplyMetric } from '../entities/SupplyMetric';

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
    vault.save();
  } else if (to == null && from != null) {
    vault.supply = vault.supply.minus(amount);
    vault.save();
  }

  // Record a metric for the total supply change if this was a mint or burn event.
  if (from == null || to == null) {
    recordSupplyMetric(vault, event);
  }

  // Record the case where a depositor minted or received shares.
  if (to != null) {
    createIncomingTransfer(event, amount, vault, to, from);
  }

  // Record the case where a depositor sent or burned shares.
  if (from != null) {
    createOutgoingTransfer(event, amount, vault, from, to);
  }
}
