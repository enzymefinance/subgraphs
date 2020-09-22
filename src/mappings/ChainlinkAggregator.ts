import { dataSource } from '@graphprotocol/graph-ts';
import { useAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import { AnswerUpdated } from '../generated/AggregatorInterface';
import { AnswerUpdatedEvent } from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/tokenValue';

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let assetId = dataSource.context().getString('asset');
  let asset = useAsset(assetId);

  let answerUpdated = new AnswerUpdatedEvent(genericId(event));
  answerUpdated.contract = ensureContract(event.address, 'ChainlinkAggregator', event).id;
  answerUpdated.timestamp = event.block.timestamp;
  answerUpdated.transaction = ensureTransaction(event).id;

  answerUpdated.current = toBigDecimal(event.params.current, asset.decimals);
  answerUpdated.roundId = event.params.roundId;
  answerUpdated.updatedAt = event.params.updatedAt;
  answerUpdated.save();
}
