import { MarketForUserUpdated, PtForUserUpdated } from '../generated/contracts/PendleMarketsRegistryEvents';
import { ensurePendleV2AllowedMarket } from '../entities/PendleV2Position';

export function handleMarketForUserUpdated(event: MarketForUserUpdated): void {
  let market = ensurePendleV2AllowedMarket(event.params.user, event.params.marketAddress);
  let duration = event.params.duration.toI32();
  market.duration = duration;
  market.active = duration > 0;
  market.save();
}

export function handlePtForUserUpdated(event: PtForUserUpdated): void {}
