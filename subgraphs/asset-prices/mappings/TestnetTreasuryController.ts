import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { getOrCreateAsset, updateAssetPrice } from '../entities/Asset';
import { PriceUpdated, TokenDeployed } from '../generated/TestnetTreasuryControllerContract';
import { initializeCurrencies } from '../utils/initializeCurrencies';

export function handleTokenDeployed(event: TokenDeployed): void {
  initializeCurrencies(event); // It's fine to only do that here.
  getOrCreateAsset(event.params.asset, 0, event);
}

export function handlePriceUpdated(event: PriceUpdated): void {
  let asset = getOrCreateAsset(event.params.asset, 0, event);
  let price = toBigDecimal(event.params.price, asset.decimals);
  updateAssetPrice(asset, price, event);
}
