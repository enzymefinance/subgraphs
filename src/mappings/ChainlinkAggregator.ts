import { Address, dataSource } from '@graphprotocol/graph-ts';
import { ensureAsset } from '../entities/Asset';
import { fetchAssetPrice, trackAssetPrice } from '../entities/AssetPrice';
import { useChainlinkAggregatorProxy } from '../entities/ChainlinkAggregatorProxy';
import { ensureCurrency } from '../entities/Currency';
import { trackCurrencyPrice } from '../entities/CurrencyPrice';
import { AnswerUpdated } from '../generated/ChainlinkAggregatorContract';
import { triggerCron } from '../utils/cronManager';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let context = dataSource.context();

  let proxy = useChainlinkAggregatorProxy(context.getString('proxy'));
  if (proxy.aggregator != event.address.toHex()) {
    return;
  }

  let current = toBigDecimal(event.params.current, proxy.decimals);

  if (proxy.type == 'ASSET') {
    let asset = ensureAsset(Address.fromString(proxy.asset as string));

    // NOTES:
    // - we use the block timestamp here on purpose (instead of event.params.updatedAt).
    // - for USD based asset, we fetch the asset price, which is simpler than fetching the ETH/USD price and then converting it.
    trackAssetPrice(asset, event.block.timestamp, asset.type == 'USD' ? fetchAssetPrice(asset) : current);
  } else if (proxy.type == 'ETHUSD' || proxy.type == 'CURRENCY') {
    let currency = ensureCurrency(proxy.currency as string);

    trackCurrencyPrice(currency, event.block.timestamp, current);
  }

  // NOTE: We might want to add this to other mappings in our code base too. We'll need to do some
  // fine tuning to find the right balance (consider performance penalty of using this too
  // frequently). The chainlink aggregators are a great spot for this because they run fairly
  // regularly so this should scale well here.
  triggerCron(event.block.timestamp);
}

// There is no need to observe the `NewRound` event
