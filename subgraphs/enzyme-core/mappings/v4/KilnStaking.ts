import { arrayUnique } from '@enzymefinance/subgraph-utils';
import { useKilnStakingPosition } from '../../entities/KilnStakingPosition';
import { Deposit } from '../../generated/contracts/KilnStaking4Events';

export function handleDeposit(event: Deposit): void {
  let kilnStakingPosition = useKilnStakingPosition(event.params.caller.toHex());
  kilnStakingPosition.publicKeys = arrayUnique(kilnStakingPosition.publicKeys.concat([event.params.publicKey]));
  kilnStakingPosition.save();
}
