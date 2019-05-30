import { Address, log } from "@graphprotocol/graph-ts";
import {
  Registry,
  Version,
  Asset,
  Engine,
  PriceSource,
  MlnToken,
  NativeAsset,
  ExchangeAdapter
} from "../types/schema";
import {
  VersionRegistration,
  AssetRemoval,
  AssetUpsert,
  EngineChange,
  NativeAssetChange,
  MlnTokenChange,
  ExchangeAdapterUpsert,
  ExchangeAdapterRemoval
} from "../types/RegistryDataSource/RegistryContract";
import { saveContract } from "./utils/saveContract";
import { PriceSourceChange } from "../types/PriceSourceDataSource/RegistryContract";
import { currentState } from "./utils/currentState";

function registryEntity(address: Address): Registry {
  let id = address.toHex();
  let registry = Registry.load(id);

  if (!registry) {
    registry = new Registry(id);
    registry.exchangeAdapters = [];
    registry.assets = [];
    registry.save();
  }

  return registry as Registry;
}

function engineEntity(address: Address, registry: Address): Engine {
  let id = address.toHex();
  let engine = Engine.load(id);

  if (!engine) {
    engine = new Engine(id);
    engine.registry = registry.toHex();
    engine.save();
  }

  return engine as Engine;
}

export function handleVersionRegistration(event: VersionRegistration): void {
  let id = event.params.version.toHex();
  let version = Version.load(id);

  if (!version) {
    version = new Version(id);
    version.registry = event.address.toHex();
    version.save();

    saveContract(
      id,
      "Version",
      event.block.timestamp,
      event.block.number,
      event.address.toHex()
    );
  }
}

export function handleAssetUpsert(event: AssetUpsert): void {
  let registry = registryEntity(event.address);
  let id = event.params.asset.toHex();
  let asset = Asset.load(id) || new Asset(id);
  asset.name = event.params.name;
  asset.symbol = event.params.symbol;
  asset.decimals = event.params.decimals.toI32();
  asset.url = event.params.url;
  asset.reserveMin = event.params.reserveMin;
  asset.registry = event.address.toHex();
  asset.save();

  registry.assets = registry.assets.concat([asset.id]);
  registry.save();

  saveContract(
    id,
    "Asset",
    event.block.timestamp,
    event.block.number,
    event.address.toHex()
  );
}

export function handleAssetRemoval(event: AssetRemoval): void {
  let assetId = event.params.asset.toHex();
  let registry = registryEntity(event.address);
  let removed = assetId;
  let assets = new Array<string>();
  for (let i: i32 = 0; i < registry.assets.length; i++) {
    let current = (registry.assets as string[])[i];
    if (current !== removed) {
      assets = assets.concat([current]);
    }
  }
  registry.assets = assets;
  registry.save();

  let asset = Asset.load(assetId) || new Asset(assetId);
  asset.registry = "";
  asset.save();
}

export function handleExchangeAdapterUpsert(
  event: ExchangeAdapterUpsert
): void {
  // let registry = registryEntity(event.address);

  let sigs = event.params.sigs.map<string>(value => value.toHexString());

  let id = event.params.adapter.toHex();
  let exchangeAdapter = ExchangeAdapter.load(id) || new ExchangeAdapter(id);
  exchangeAdapter.exchange = event.params.exchange.toHex();
  exchangeAdapter.takesCustody = event.params.takesCustody;
  exchangeAdapter.sigs =
    sigs[0] + "-" + sigs[1] + "-" + sigs[2] + "-" + sigs[3];
  exchangeAdapter.registry = event.address.toHex();
  exchangeAdapter.save();

  // registry.exchangeAdapters = registry.exchangeAdapters.concat([
  //   exchangeAdapter.id
  // ]);
  // registry.save();

  saveContract(
    id,
    "ExchangeAdapter",
    event.block.timestamp,
    event.block.number,
    event.address.toHex()
  );
}

export function handleExchangeAdapterRemoval(
  event: ExchangeAdapterRemoval
): void {
  let exchangeAdapterId = event.params.exchange.toHex();
  let registry = registryEntity(event.address);
  let removed = exchangeAdapterId;
  let exchangeAdapters = new Array<string>();
  for (let i: i32 = 0; i < registry.exchangeAdapters.length; i++) {
    let current = (registry.exchangeAdapters as string[])[i];
    if (current !== removed) {
      exchangeAdapters = exchangeAdapters.concat([current]);
    }
  }
  registry.exchangeAdapters = exchangeAdapters;
  registry.save();

  let exchangeAdapter =
    ExchangeAdapter.load(exchangeAdapterId) ||
    new ExchangeAdapter(exchangeAdapterId);
  exchangeAdapter.registry = "";
  exchangeAdapter.save();
}

export function handleEngineChange(event: EngineChange): void {
  let registry = registryEntity(event.address);
  let engine = engineEntity(event.params.engine, event.address);
  registry.engine = engine.id;
  registry.save();

  let state = currentState();
  state.currentEngine = event.params.engine.toHex();
  state.save();

  saveContract(
    registry.id,
    "Registry",
    event.block.timestamp,
    event.block.number,
    ""
  );

  saveContract(
    engine.id,
    "Engine",
    event.block.timestamp,
    event.block.number,
    event.address.toHex()
  );
}

export function handlePriceSourceChange(event: PriceSourceChange): void {
  let priceSource = new PriceSource(event.params.priceSource.toHex());
  priceSource.registry = event.address.toHex();
  priceSource.save();

  saveContract(
    event.address.toHex(),
    "Registry",
    event.block.timestamp,
    event.block.number,
    ""
  );

  saveContract(
    priceSource.id,
    "PriceSource",
    event.block.timestamp,
    event.block.number,
    event.address.toHex()
  );
}

export function handleMlnTokenChange(event: MlnTokenChange): void {
  let mlnToken = new MlnToken(event.params.mlnToken.toHex());
  mlnToken.registry = event.address.toHex();
  mlnToken.save();

  saveContract(
    event.address.toHex(),
    "Registry",
    event.block.timestamp,
    event.block.number,
    ""
  );

  saveContract(
    mlnToken.id,
    "MlnToken",
    event.block.timestamp,
    event.block.number,
    event.address.toHex()
  );
}

export function handleNativeAssetChange(event: NativeAssetChange): void {
  let nativeAssset = new NativeAsset(event.params.nativeAsset.toHex());
  nativeAssset.registry = event.address.toHex();
  nativeAssset.save();

  saveContract(
    event.address.toHex(),
    "Registry",
    event.block.timestamp,
    event.block.number,
    ""
  );

  saveContract(
    nativeAssset.id,
    "NativeAsset",
    event.block.timestamp,
    event.block.number,
    event.address.toHex()
  );
}
