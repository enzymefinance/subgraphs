import { ensureMinSharesSupplyFee } from '../../entities/MinSharesSupplyFee';
import { Settled } from '../../generated/contracts/MinSharesSupplyFee4Events';

export function handleSettled(event: Settled): void {
  let fee = ensureMinSharesSupplyFee(event.params.comptrollerProxy, event.address, event);
  fee.lastSettled = event.block.timestamp.toI32();
  fee.save();
}
