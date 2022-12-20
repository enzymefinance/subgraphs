import {
  getTheGraphDelegationToIndexerId,
  useTheGraphDelegationToIndexer,
} from '../../entities/TheGraphDelegationToIndexer';
import { IndexerAdded, IndexerRemoved } from '../../generated/contracts/TheGraphDelegationPositionLib4Events';

export function handleIndexerAdded(event: IndexerAdded): void {}

export function handleIndexerRemoved(event: IndexerRemoved): void {
  let id = getTheGraphDelegationToIndexerId(event.address, event.params.indexer);
  let theGraphDelegationToIndexer = useTheGraphDelegationToIndexer(id);
  theGraphDelegationToIndexer.externalPosition = null;
  theGraphDelegationToIndexer.save();
}
