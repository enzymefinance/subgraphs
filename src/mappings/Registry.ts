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

function assetNameFromAddress(address: Address): string {
  let name = "";
  if (address.toHex() == "0x0d8775f648430679a709e98d2b0cb6250d2887ef") {
    name = "Basic Attention Token";
  }
  if (address.toHex() == "0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf") {
    name = "Digix Gold Token";
  }
  if (address.toHex() == "0x1985365e9f78359a9b6ad760e32412f4a445e862") {
    name = "Rep Token";
  }
  if (address.toHex() == "0xe41d2489571d322189246dafa5ebde1f4699f498") {
    name = "ZeroX Protocol Token";
  }
  if (address.toHex() == "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") {
    name = "Eth Token";
  }
  if (address.toHex() == "0xec67005c4e498ec7f55e092bd1d35cbc47c91892") {
    name = "Melon Token";
  }
  if (address.toHex() == "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2") {
    name = "MakerDao";
  }
  if (address.toHex() == "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359") {
    name = "Dai";
  }
  if (address.toHex() == "0xdd974d5c2e2928dea5f71b9825b8b646686bd200") {
    name = "Kyber Network";
  }
  if (address.toHex() == "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48") {
    name = "USD Coin";
  }
  if (address.toHex() == "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599") {
    name = "Wrapped BTC";
  }
  return name;
}

export function handleAssetUpsert(event: AssetUpsert): void {
  let id = event.params.asset.toHex();
  let asset = new Asset(id);
  asset.name = assetNameFromAddress(event.params.asset);
  asset.symbol = event.params.symbol;
  asset.decimals = event.params.decimals.toI32();
  asset.createdAt = event.block.timestamp;
  asset.url = event.params.url;
  asset.reserveMin = event.params.reserveMin;
  asset.registry = event.address.toHex();
  asset.removedFromRegistry = false;
  asset.fundAccountings = [];
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
    name = "ZeroEx (v2.0)";
  }
  if (address.toHex() == "0x080bf510fcbf18b91105470639e9561022937712") {
    name = "ZeroEx (v2.1)";
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
  exchangeAdapter.createdAt = event.block.timestamp;
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
