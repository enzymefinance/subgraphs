import { AssetRemoval } from '../../generated/templates/v2/RegistryContract/RegistryContract';
import { createEvent } from '../../utils/event';
import { dataSource, Address, Value } from '@graphprotocol/graph-ts';

let context = dataSource.context();
let version = Address.fromString((context.get('version') as Value).toString());

export function handleAssetRemoval(event: AssetRemoval): void {
  let entity = createEvent('AssetRemoval', event, version);
}
