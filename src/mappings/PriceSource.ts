import { PriceUpdate } from '../generated/PriceSourceContract';
import { Context } from '../context';
import { dataSource, Address, BigDecimal } from '@graphprotocol/graph-ts';
import { ensurePriceSource, createPriceUpdate } from '../entities/PriceUpdate';
import { Asset } from '../generated/schema';
import { useAsset } from '../entities/Asset';
import { toBigDecimal } from '../utils/tokenValue';

export function handlePriceUpdate(event: PriceUpdate): void {
  let context = new Context(dataSource.context(), event);

  let registryPriceSource = context.contracts.registry.priceSource();
  if (event.address != registryPriceSource) {
    return;
  }

  let priceSource = ensurePriceSource(event.address, context);

  let assets = event.params.token.map<Asset>((id) => useAsset(id.toHex()));
  let prcs = event.params.price;

  let prices: BigDecimal[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    prices.push(toBigDecimal(prcs[i], 18)); // prices are in WETH (18 decimals)
  }

  createPriceUpdate(priceSource, assets, prices, context);
}
