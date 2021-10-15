import { toBigDecimal, ZERO_ADDRESS, ZERO_BI } from '@enzymefinance/subgraph-utils';
import { getOrCreateAsset, updateAssetPrice } from '../entities/Asset';
import { PriceUpdated, TokenDeployed } from '../generated/contracts/TestnetTreasuryControllerEvents';
import { initializeCurrencies } from '../utils/initializeCurrencies';

export function handleTokenDeployed(event: TokenDeployed): void {
  initializeCurrencies(event); // It's fine to only do that here.
  getOrCreateAsset(event.params.asset, ZERO_ADDRESS, event, ZERO_BI);
}

export function handlePriceUpdated(event: PriceUpdated): void {
  getOrCreateAsset(event.params.asset, ZERO_ADDRESS, event, event.params.price);
}
