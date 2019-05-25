import { Address, log } from "@graphprotocol/graph-ts";
import { Registry, Version, Asset, Engine, Contract } from "../types/schema";
import {
  VersionRegistration,
  AssetRemoval,
  AssetUpsert,
  EngineChange,
  NativeAssetChange
} from "../types/RegistryDataSource/RegistryContract";
import { saveContract } from "./utils/saveContract";

function registryEntity(address: Address): Registry {
  let id = address.toHex();
  let registry = Registry.load(id);

  if (!registry) {
    registry = new Registry(id);
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
  registry.engine = engine.id;
  registry.save();

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

export function handleNativeAssetChange(event: NativeAssetChange): void {}
