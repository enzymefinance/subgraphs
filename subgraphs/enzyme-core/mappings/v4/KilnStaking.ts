import { ensureKilnStakingPositionValidator, useKilnStakingPosition } from '../../entities/KilnStakingPosition';
import { Deposit, ExitRequest } from '../../generated/contracts/KilnStaking4Events';

export function handleDeposit(event: Deposit): void {
  let kilnStakingPosition = useKilnStakingPosition(event.params.caller.toHex());

  let validator = ensureKilnStakingPositionValidator(event.params.publicKey, kilnStakingPosition);
  validator.timestamp = event.block.timestamp.toI32();
  validator.save();
}

export function handleExitRequest(event: ExitRequest): void {
  let kilnStakingPosition = useKilnStakingPosition(event.params.caller.toHex());

  let validator = ensureKilnStakingPositionValidator(event.params.pubkey, kilnStakingPosition);
  validator.unstakeSignalled = true;
  validator.unstakeSignalledAt = event.block.timestamp.toI32();
  validator.save();
}
