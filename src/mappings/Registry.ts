import { Address, log, BigInt } from "@graphprotocol/graph-ts";
import {
  Registry,
  Version,
  Asset,
  Engine,
  PriceSource,
  MlnToken,
  NativeAsset,
  ExchangeAdapter,
  MGM,
  Exchange
} from "../types/schema";
import {
  VersionRegistration,
  AssetRemoval,
  AssetUpsert,
  EngineChange,
  NativeAssetChange,
  MlnTokenChange,
  ExchangeAdapterUpsert,
  ExchangeAdapterRemoval,
  RegistryContract,
  MGMChange
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

  let registryContract = RegistryContract.bind(event.address);
  let versionInformation = registryContract.versionInformation(
    event.params.version
  );

  let version = Version.load(id);

  if (!version) {
    version = new Version(id);
    version.registry = event.address.toHex();
    version.name = versionInformation.value1.toHexString();
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
  // let registry = registryEntity(event.address);
  let id = event.params.asset.toHex();
  let asset = new Asset(id);
  asset.name = event.params.name;
  asset.symbol = event.params.symbol;
  asset.decimals = event.params.decimals.toI32();
  asset.url = event.params.url;
  asset.reserveMin = event.params.reserveMin;
  asset.registry = event.address.toHex();
  asset.removedFromRegistry = false;
  asset.save();

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
  // let registry = registryEntity(event.address);
  // let removed = assetId;
  // let assets = new Array<string>();
  // for (let i: i32 = 0; i < registry.assets.length; i++) {
  //   let current = (registry.assets as string[])[i];
  //   if (current !== removed) {
  //     assets = assets.concat([current]);
  //   }
  // }
  // registry.assets = assets;
  // registry.save();

  let asset = Asset.load(assetId) || new Asset(assetId);
  asset.removedFromRegistry = true;
  asset.removedFromRegistryAt = event.block.timestamp;
  asset.save();
}

function exchangeNameFromAddress(address: Address): string {
  let name = "";
  if (address.toHex() == "0x39755357759ce0d7f32dc8dc45414cca409ae24e") {
    name = "MatchingMarket";
  }
  if (address.toHex() == "0x818e6fecd516ecc3849daf6845e3ec868087b755") {
    name = "KyberNetwork";
  }
  if (address.toHex() == "0x4f833a24e1f95d70f028921e27040ca56e09ab0b") {
    name = "ZeroEx";
  }
  if (address.toHex() == "0xdcdb42c9a256690bd153a7b409751adfc8dd5851") {
    name = "Ethfinex";
  }
  if (address.toHex() == "0x7caec96607c5c7190d63b5a650e7ce34472352f5") {
    name = "MelonEngine";
  }
  if (address.toHex() == "0xcbb801141a1704dbe5b4a6224033cfae80c4b336") {
    name = "MelonEngine (v1)";
  }
  return name;
}

export function handleExchangeAdapterUpsert(
  event: ExchangeAdapterUpsert
): void {
  let id = event.params.adapter.toHex();

  let exchange = new Exchange(event.params.exchange.toHex());
  exchange.name = exchangeNameFromAddress(event.params.exchange);
  exchange.adapter = id;
  exchange.save();

  let sigs = event.params.sigs.map<string>(value => value.toHexString());

  let exchangeAdapter = ExchangeAdapter.load(id) || new ExchangeAdapter(id);
  exchangeAdapter.exchange = event.params.exchange.toHex();
  exchangeAdapter.takesCustody = event.params.takesCustody;
  exchangeAdapter.sigs =
    sigs[0] + "-" + sigs[1] + "-" + sigs[2] + "-" + sigs[3];
  exchangeAdapter.registry = event.address.toHex();
  exchangeAdapter.removedFromRegistry = false;
  exchangeAdapter.save();

  saveContract(
    id,
    "ExchangeAdapter",
    event.block.timestamp,
    event.block.number,
    event.address.toHex()
  );

  saveContract(
    event.params.exchange.toHex(),
    "Exchange",
    event.block.timestamp,
    event.block.number,
    event.params.adapter.toHex()
  );
}

export function handleExchangeAdapterRemoval(
  event: ExchangeAdapterRemoval
): void {
  let exchangeAdapterId = event.params.exchange.toHex();
  // let registry = registryEntity(event.address);
  // let removed = exchangeAdapterId;
  // let exchangeAdapters = new Array<string>();
  // for (let i: i32 = 0; i < registry.exchangeAdapters.length; i++) {
  //   let current = (registry.exchangeAdapters as string[])[i];
  //   if (current !== removed) {
  //     exchangeAdapters = exchangeAdapters.concat([current]);
  //   }
  // }
  // registry.exchangeAdapters = exchangeAdapters;
  // registry.save();

  let exchangeAdapter =
    ExchangeAdapter.load(exchangeAdapterId) ||
    new ExchangeAdapter(exchangeAdapterId);
  exchangeAdapter.removedFromRegistry = true;
  exchangeAdapter.removedFromRegistryAt = event.block.timestamp;
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

  // use pricesource template

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

export function handleMGMChange(event: MGMChange): void {
  let mgm = new MGM(event.params.MGM.toHex());
  mgm.registry = event.address.toHex();
  mgm.save();
}
