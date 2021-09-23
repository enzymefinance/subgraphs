import {
  PositionDeployed,
  PositionDeployerAdded,
  PositionDeployerRemoved,
  PositionTypeAdded,
  PositionTypeLabelUpdated,
} from '../../generated/contracts/ExternalPositionFactory4Events';

export function handlePositionDeployed(event: PositionDeployed): void {}
export function handlePositionDeployerAdded(event: PositionDeployerAdded): void {}
export function handlePositionDeployerRemoved(event: PositionDeployerRemoved): void {}
export function handlePositionTypeAdded(event: PositionTypeAdded): void {}
export function handlePositionTypeLabelUpdated(event: PositionTypeLabelUpdated): void {}
