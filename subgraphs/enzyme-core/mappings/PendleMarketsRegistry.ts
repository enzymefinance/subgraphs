import { useVault } from '../entities/Vault';
import { MarketAdded, MarketRemoved } from '../generated/contracts/PendleMarketsRegistryEvents';
import { ensurePendleV2AllowedMarket, usePendleV2AllowedMarket } from '../entities/PendleV2Position';

export function handleMarketAdded(event: MarketAdded): void {
  let market = ensurePendleV2AllowedMarket(event.params.vaultProxy, event.params.marketAddress);
  market.duration = event.params.duration.toI32();
  market.active = true;
  market.save();
}

export function handleMarketRemoved(event: MarketRemoved): void {
  let market = usePendleV2AllowedMarket(event.params.vaultProxy, event.params.marketAddress);
  market.active = false;
  market.save();
}
