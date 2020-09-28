import { dataSource } from '@graphprotocol/graph-ts';
import { useAsset } from '../entities/Asset';
import { assetPriceId } from '../entities/AssetPrice';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import { AnswerUpdated, NewRound } from '../generated/AggregatorInterface';
import { AnswerUpdatedEvent, AssetPrice } from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let assetId = dataSource.context().getString('asset');
  let asset = useAsset(assetId);

  let answerUpdated = new AnswerUpdatedEvent(genericId(event));
  answerUpdated.contract = ensureContract(event.address, 'ChainlinkAggregator', event).id;
  answerUpdated.timestamp = event.block.timestamp;
  answerUpdated.transaction = ensureTransaction(event).id;

  answerUpdated.asset = asset.id;
  answerUpdated.current = toBigDecimal(event.params.current, asset.decimals);
  answerUpdated.roundId = event.params.roundId;
  answerUpdated.updatedAt = event.params.updatedAt;
  answerUpdated.save();

  let assetPrice = new AssetPrice(assetPriceId(asset, event));
  assetPrice.asset = asset.id;
  assetPrice.timestamp = event.block.timestamp;
  assetPrice.price = toBigDecimal(event.params.current, asset.decimals);
  assetPrice.save();
}

export function handleNewRound(event: NewRound): void {}
