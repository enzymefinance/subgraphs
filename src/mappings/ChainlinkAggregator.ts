import { dataSource } from '@graphprotocol/graph-ts';
import { useAsset } from '../entities/Asset';
import { trackAssetPrice } from '../entities/AssetPrice';
import { useChainlinkAggregator } from '../entities/ChainlinkAggregator';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import { AnswerUpdated } from '../generated/ChainlinkAggregatorContract';
import { Asset, ChainlinkAggregatorAnswerUpdatedEvent } from '../generated/schema';
import { ensureCron, triggerCron } from '../utils/cronManager';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let context = dataSource.context();
  let aggregator = useChainlinkAggregator(context.getString('aggregator'));
  if (!aggregator.active) {
    return;
  }

  let decimals = context.getI32('decimals');
  let current = toBigDecimal(event.params.current, decimals);

  let answerUpdated = new ChainlinkAggregatorAnswerUpdatedEvent(genericId(event));
  answerUpdated.contract = ensureContract(event.address, 'ChainlinkAggregator').id;
  answerUpdated.timestamp = event.block.timestamp;
  answerUpdated.transaction = ensureTransaction(event).id;
  answerUpdated.aggregator = aggregator.id;
  answerUpdated.current = current;
  answerUpdated.roundId = event.params.roundId;
  answerUpdated.updatedAt = event.params.updatedAt;
  answerUpdated.save();

  if (aggregator.type == 'ASSET') {
    let asset = useAsset(aggregator.asset as string);
    answerUpdated.asset = asset.id;
    answerUpdated.save();

    // NOTE: We use the block timestamp here on purpose (instead of event.params.updatedAt).
    trackAssetPrice(asset, event.block.timestamp, current);
  } else if (aggregator.type === 'ETHUSD') {
    let cron = ensureCron();
    let assets = cron.usdQuotedPrimitives.map<Asset>((primitive) => useAsset(primitive));

    for (let i: i32 = 0; i < assets.length; i++) {
      let asset = assets[i];
      trackAssetPrice(asset, event.block.timestamp);
    }
  }

  // NOTE: We might want to add this to other mappings in our code base too. We'll need to do some
  // fine tuning to find the right balance (consider performance penalty of using this too
  // frequently). The chainlink aggregators are a great spot for this because they run fairly
  // regularly so this should scale well here.
  triggerCron(event.block.timestamp);
}
