import { useVault } from "../entities/Vault";
import { MarketAdded, MarketRemoved } from "../generated/contracts/PendleMarketsRegistryEvents";
import { ensurePendleV2AllowedMarket } from "../entities/PendleV2Position";


export function handleMarketAdded( event: MarketAdded): void {
    let vault = useVault(event.params.vaultProxy.toHex())

    let market = ensurePendleV2AllowedMarket(vault, event.params.marketAddress);
    market.duration = event.params.duration.toI32();
    market.active = true;
    market.save()
}

export function handleMarketRemoved( event: MarketRemoved): void {
    let vault = useVault(event.params.vaultProxy.toHex())

    let market = ensurePendleV2AllowedMarket(vault, event.params.marketAddress);
    market.active = false;
    market.save()
}