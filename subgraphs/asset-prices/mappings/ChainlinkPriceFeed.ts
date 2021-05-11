import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { ensureAsset } from './entities/Asset';
import { trackAssetPrice } from './entities/AssetPrice';
import {
  ensureChainlinkAssetAggregatorProxy,
  ensureChainlinkCurrencyAggregatorProxy,
  ensureChainlinkEthUsdAggregatorProxy,
} from './entities/ChainlinkAggregatorProxy';
import { PrimitiveAdded, PrimitiveRemoved, PrimitiveUpdated } from '../generated/ChainlinkPriceFeedContract';

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  // TODO
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  // TODO
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {
  // TODO
}
