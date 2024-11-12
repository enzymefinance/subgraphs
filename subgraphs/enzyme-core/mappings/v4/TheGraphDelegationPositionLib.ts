import { dataSource } from '@graphprotocol/graph-ts';
import {
  getTheGraphDelegationToIndexerId,
  useTheGraphDelegationToIndexer,
} from '../../entities/TheGraphDelegationToIndexer';
import { IndexerAdded, IndexerRemoved } from '../../generated/contracts/TheGraphDelegationPositionLib4Events';

export function handleIndexerAdded(event: IndexerAdded): void {}

export function handleIndexerRemoved(event: IndexerRemoved): void {
  // Returning early on Arbitrum until this has been tested
  if (dataSource.network() == 'arbitrum-one') {
    return;
  }

  let id = getTheGraphDelegationToIndexerId(event.address, event.params.indexer);
  let theGraphDelegationToIndexer = useTheGraphDelegationToIndexer(id);
  theGraphDelegationToIndexer.active = false;
  theGraphDelegationToIndexer.save();
}
