import { BigDecimal } from '@graphprotocol/graph-ts';
import { ethPerKilnNode, useKilnStakingPosition } from '../../entities/KilnStakingPosition';
import {
  PositionValuePaused,
  PositionValueUnpaused,
  ValidatorsAdded,
  ValidatorsRemoved,
} from '../../generated/contracts/KilnStakingPositionLib4Events';
import { toBigDecimal } from '@enzymefinance/subgraph-utils';

export function handlePositionValuePaused(event: PositionValuePaused): void {
  let kilnStakingPosition = useKilnStakingPosition(event.address.toHex());
  kilnStakingPosition.positionValuePaused = true;
  kilnStakingPosition.save();
}

export function handlePositionValueUnpaused(event: PositionValueUnpaused): void {
  let kilnStakingPosition = useKilnStakingPosition(event.address.toHex());
  kilnStakingPosition.positionValuePaused = false;
  kilnStakingPosition.save();
}

export function handleValidatorsAdded(event: ValidatorsAdded): void {
  let amount = toBigDecimal(event.params.validatorAmount, 0).times(ethPerKilnNode);

  let kilnStakingPosition = useKilnStakingPosition(event.address.toHex());
  kilnStakingPosition.stakedEthAmount = kilnStakingPosition.stakedEthAmount.plus(amount);
  kilnStakingPosition.save();
}

export function handleValidatorsRemoved(event: ValidatorsRemoved): void {
  let amount = toBigDecimal(event.params.validatorAmount, 0).times(ethPerKilnNode);

  let kilnStakingPosition = useKilnStakingPosition(event.address.toHex());
  kilnStakingPosition.stakedEthAmount = kilnStakingPosition.stakedEthAmount.minus(amount);
  kilnStakingPosition.save();
}
