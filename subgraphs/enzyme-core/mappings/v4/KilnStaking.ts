import { ensureKilnStakingPositionValidator, useKilnStakingPosition } from '../../entities/KilnStakingPosition';
import { Deposit } from '../../generated/contracts/KilnStaking4Events';

export function handleDeposit(event: Deposit): void {
  let kilnStakingPosition = useKilnStakingPosition(event.params.caller.toHex());

  ensureKilnStakingPositionValidator(event.params.publicKey, kilnStakingPosition, event);
}
