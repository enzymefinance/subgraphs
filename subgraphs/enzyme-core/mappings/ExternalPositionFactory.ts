import {
  PositionDeployed,
  PositionDeployerAdded,
  PositionDeployerRemoved,
  PositionTypeAdded,
  PositionTypeLabelUpdated,
} from '../generated/contracts/ExternalPositionFactoryEvents';
import { ExternalPositionType } from '../generated/schema';

export function handlePositionTypeAdded(event: PositionTypeAdded): void {
  let type = new ExternalPositionType(event.params.typeId.toString());
  type.label = event.params.label;
  type.save();
}
export function handlePositionTypeLabelUpdated(event: PositionTypeLabelUpdated): void {
  let type = new ExternalPositionType(event.params.typeId.toString());
  type.label = event.params.label;
  type.save();
}

export function handlePositionDeployed(event: PositionDeployed): void {}
export function handlePositionDeployerAdded(event: PositionDeployerAdded): void {}
export function handlePositionDeployerRemoved(event: PositionDeployerRemoved): void {}
