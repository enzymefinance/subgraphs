import { ensureMorphoBlueMarket } from '../../entities/MorphoBluePosition';
import { MarketIdAdded, MarketIdRemoved } from '../../generated/contracts/MorphoBluePositionLib4Events';

export function handleMarketIdAdded(event: MarketIdAdded): void {
  let market = ensureMorphoBlueMarket(event.address, event.params.marketId);
  market.removed = false;
  market.save();
}
export function handleMarketIdRemoved(event: MarketIdRemoved): void {
  let market = ensureMorphoBlueMarket(event.address, event.params.marketId);
  market.removed = true;
  market.save();
}
