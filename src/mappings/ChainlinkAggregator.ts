import { Address } from '@graphprotocol/graph-ts';
import { useAsset } from '../entities/Asset';
import { fetchAssetPrice, trackAssetPrice } from '../entities/AssetPrice';
import {
  disableChainlinkAssetAggregator,
  disableChainlinkCurrencyAggregator,
  disableChainlinkEthUsdAggregator,
  enableChainlinkAssetAggregator,
  enableChainlinkCurrencyAggregator,
  enableChainlinkEthUsdAggregator,
  useChainlinkAggregator,
} from '../entities/ChainlinkAggregator';
import { useCurrency } from '../entities/Currency';
import { trackCurrencyPrice } from '../entities/CurrencyPrice';
import { AnswerUpdated } from '../generated/ChainlinkAggregatorContract';
import { triggerCron } from '../utils/cronManager';
import { toBigDecimal } from '../utils/toBigDecimal';
import { unwrapAggregator } from './ChainlinkPriceFeed';

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let aggregator = useChainlinkAggregator(event.address.toHex());
  if (!aggregator.active) {
    return;
  }

  // check if the event comes from the current aggregator
  let proxy = Address.fromString(aggregator.proxy);
  let currentAggregator = unwrapAggregator(proxy);
  if (event.address.toHex() != currentAggregator.toHex()) {
    if (aggregator.type == 'ASSET') {
      let asset = useAsset(aggregator.asset as string);
      disableChainlinkAssetAggregator(event.address);
      aggregator = enableChainlinkAssetAggregator(proxy, currentAggregator, asset);
    } else if (aggregator.type == 'ETHUSD') {
      let eth = useCurrency('ETH');
      disableChainlinkEthUsdAggregator(event.address);
      aggregator = enableChainlinkEthUsdAggregator(proxy, currentAggregator, eth);
    } else if (aggregator.type == 'CURRENCY') {
      let currency = useCurrency(aggregator.currency as string);
      disableChainlinkCurrencyAggregator(event.address);
      aggregator = enableChainlinkCurrencyAggregator(proxy, currentAggregator, currency);
    }
  }

  let current = toBigDecimal(event.params.current, aggregator.decimals);

  if (aggregator.type == 'ASSET') {
    let asset = useAsset(aggregator.asset as string);

    // NOTES:
    // - we use the block timestamp here on purpose (instead of event.params.updatedAt).
    // - for USD based asset, we fetch the asset price, which is simpler than fetching the ETH/USD price and then converting it.
    trackAssetPrice(asset, event.block.timestamp, asset.type == 'USD' ? fetchAssetPrice(asset) : current);
  } else if (aggregator.type == 'ETHUSD' || aggregator.type == 'CURRENCY') {
    let currency = useCurrency(aggregator.currency as string);

    trackCurrencyPrice(currency, event.block.timestamp, current);
  }

  // NOTE: We might want to add this to other mappings in our code base too. We'll need to do some
  // fine tuning to find the right balance (consider performance penalty of using this too
  // frequently). The chainlink aggregators are a great spot for this because they run fairly
  // regularly so this should scale well here.
  triggerCron(event.block.timestamp);
}

// There is no need to observe the `NewRound` event
