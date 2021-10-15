import { toBigDecimal, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts';
import { SharedSdk } from '../generated/contracts/SharedSdk';
import { Asset } from '../generated/schema';
import { fetchAssetPrice } from '../utils/fetchAssetPrice';

export function getOrCreateAsset(
  address: Address,
  version: Address,
  event: ethereum.Event,
  price: BigInt | null = null,
): Asset {
  let id = address.toHex();
  let asset = Asset.load(id);

  if (asset == null) {
    let contract = SharedSdk.bind(address);
    let decimals = contract.try_decimals();

    asset = new Asset(id);
    asset.decimals = decimals.reverted ? 18 : decimals.value;
    asset.registrations = [];
    asset.updated = event.block.timestamp.toI32();
    asset.price = ZERO_BD;
    asset.save();

    if (!price) {
      updateAssetPriceWithValueInterpreter(asset, version, event);
    } else {
      updateAssetPrice(asset, toBigDecimal(price as BigInt, asset.decimals), event);
    }
  }

  return asset;
}

export function getAsset(assetAddress: string): Asset {
  let asset = Asset.load(assetAddress);
  if (asset == null) {
    log.critical('Failed to load asset {}', [assetAddress]);
  }

  return asset as Asset;
}

export function updateAssetPrice(asset: Asset, price: BigDecimal, event: ethereum.Event): void {
  asset.updated = event.block.timestamp.toI32();
  asset.price = price;
  asset.save();
}

export function updateAssetPriceWithValueInterpreter(asset: Asset, version: Address, event: ethereum.Event): void {
  let value = fetchAssetPrice(asset, version);
  updateAssetPrice(asset, value, event);
}
