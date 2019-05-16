import { Address } from "@graphprotocol/graph-ts";
import { Registry, Version, Asset, Engine } from "../types/schema";
import {
  VersionRegistration,
  AssetRemoval,
  AssetUpsert,
  EngineChange
} from "../types/RegistryDataSource/RegistryContract";

function registryEntity(address: Address): Registry {
  let id = address.toHex();
  let registry = Registry.load(id);

  if (!registry) {
    registry = new Registry(id);
    registry.versions = [];
    registry.assets = [];
    registry.engines = [];
    registry.save();
  }

  return registry as Registry;
}

function versionEntity(registry: Address, address: Address): Version {
  let id = address.toHex();
  let version = Version.load(id);

  if (!version) {
    version = new Version(id);
    version.registry = registry.toHex();
    version.save();
  }

  return version as Version;
}

function engineEntity(address: Address, registry: Address): Engine {
  let id = address.toHex();
  let engine = Engine.load(id);

  if (!engine) {
    engine = new Engine(id);
    engine.registry = [registry.toHex()];
    engine.amguPaid = [];
    engine.amguPrices = [];
    engine.save();
  }
  return engine as Engine;
}

export function handleVersionRegistration(event: VersionRegistration): void {
  let registry = registryEntity(event.address);
  let version = versionEntity(event.address, event.params.version);
  registry.versions = registry.versions.concat([version.id]);
  registry.save();
}

export function handleAssetUpsert(event: AssetUpsert): void {
  let id = event.params.asset.toHex();
  let asset = Asset.load(id) || new Asset(id);
  asset.name = event.params.name;
  asset.symbol = event.params.symbol;
  asset.decimals = event.params.decimals.toI32();
  asset.save();

  let registry = registryEntity(event.address);
  registry.assets = registry.assets.concat([asset.id]);
  registry.save();
}

export function handleAssetRemoval(event: AssetRemoval): void {
  let registry = registryEntity(event.address);
  let removed = event.params.asset.toHex();
  let assets = new Array<string>();
  for (let i: i32 = 0; i < registry.assets.length; i++) {
    let current = (registry.assets as string[])[i];
    if (current !== removed) {
      assets = assets.concat([current]);
    }
  }

  registry.assets = assets;
  registry.save();
}

export function handleEngineChange(event: EngineChange): void {
  let registry = registryEntity(event.address);
  let engine = engineEntity(event.params.engine, event.address);
  registry.engines = registry.engines.concat([engine.id]);
  registry.save();
}
