import { createComptroller } from '../entities/Comptroller';

import { ComptrollerLibDataSource } from '../generated/templates';
import { Address } from '@graphprotocol/graph-ts';

export function handleAccessorSet(nextAccessor: Address, vault: Address): void {
  createComptroller(nextAccessor, vault);
  ComptrollerLibDataSource.create(nextAccessor);
}
