import { dataSource } from "@graphprotocol/graph-ts";
import {
  EngineDataSource,
  PriceSourceDataSource,
  VersionDataSourceV1010,
  VersionDataSource,
  AccountingFactoryDataSource,
  FeeManagerFactoryDataSource,
  ParticipationFactoryDataSource,
  PolicyManagerFactoryDataSource,
  SharesFactoryDataSource,
  TradingFactoryDataSourceV101,
  TradingFactoryDataSourceV1010,
  TradingFactoryDataSource,
  VaultFactoryDataSource,
  AccountingFactoryDataSourceV1010
} from "../codegen/templates";
import {
  Registry,
  Version,
  Asset,
  PriceSource,
  MlnToken,
  NativeAsset,
  ExchangeAdapter,
  MGM,
  Exchange
} from "../codegen/schema";
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
  MGMChange,
  LogSetOwner
} from "../codegen/RegistryDataSource/RegistryContract";
import { saveContract } from "../utils/saveContract";
import { PriceSourceChange } from "../codegen/templates/PriceSourceDataSource/RegistryContract";
import { currentState } from "../utils/currentState";
import { engineEntity } from "../entities/engineEntity";
import { VersionContract } from "../codegen/templates/VersionDataSource/VersionContract";
import { assetNameFromAddress } from "../utils/assetNameFromAddress";
import { exchangeNameFromAddress } from "../utils/exchangeNameFromAddress";
import { saveEvent } from "../utils/saveEvent";
import { hexToAscii } from "../utils/hexToAscii";

export function handleLogSetOwner(event: LogSetOwner): void {
  saveEvent("LogSetOwner", event);

  let registry = Registry.load(event.address.toHex());
  if (!registry) {
    registry = new Registry(event.address.toHex());
    registry.versions = [];
  }

  registry.owner = event.params.owner.toHex();
  registry.save();

  let state = currentState();
  if (state.registry != event.address.toHex()) {
    state.registry = event.address.toHex();
    state.registries = state.registries.concat([event.address.toHex()]);
    state.save();
  }

  saveContract(registry.id, "Registry", "", event.block.timestamp, "");
}

export function handleVersionRegistration(event: VersionRegistration): void {
  saveEvent("VersionRegistration", event);

  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7271061
  ) {
    return;
  }

  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 9339586
  ) {
    VersionDataSourceV1010.create(event.params.version);
  } else {
    VersionDataSource.create(event.params.version);
  }

  let id = event.params.version.toHex();

  let registryContract = RegistryContract.bind(event.address);
  let versionInformation = registryContract.versionInformation(
    event.params.version
  );

  let version = new Version(id);
  version.registry = event.address.toHex();
  version.name = hexToAscii(versionInformation.value1.toHexString());
  version.timestamp = event.block.timestamp;
  version.funds = [];
  version.save();

  let registry = Registry.load(event.address.toHex()) as Registry;
  registry.versions = registry.versions.concat([version.id]);
  registry.save();

  saveContract(
    id,
    "Version",
    version.name,
    event.block.timestamp,
    event.address.toHex()
  );

  // create component contracts

  let versionContract = VersionContract.bind(event.params.version);

  // TODO: create correct accounting factory
  let accountingFactory = versionContract.accountingFactory();

  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 9339573
  ) {
    AccountingFactoryDataSourceV1010.create(accountingFactory);
  } else {
    AccountingFactoryDataSource.create(accountingFactory);
  }

  saveContract(
    accountingFactory.toHex(),
    "AccountingFactory",
    "",
    event.block.timestamp,
    event.params.version.toHex()
  );

  let feeManagerFactory = versionContract.feeManagerFactory();
  FeeManagerFactoryDataSource.create(feeManagerFactory);
  saveContract(
    feeManagerFactory.toHex(),
    "FeeManagerFactory",
    "",
    event.block.timestamp,
    event.params.version.toHex()
  );

  let participationFactory = versionContract.participationFactory();
  ParticipationFactoryDataSource.create(participationFactory);
  saveContract(
    participationFactory.toHex(),
    "ParticipationFactory",
    "",
    event.block.timestamp,
    event.params.version.toHex()
  );

  let policyManagerFactory = versionContract.policyManagerFactory();
  PolicyManagerFactoryDataSource.create(policyManagerFactory);
  saveContract(
    policyManagerFactory.toHex(),
    "PolicyManagerFactory",
    "",
    event.block.timestamp,
    event.params.version.toHex()
  );

  let sharesFactory = versionContract.sharesFactory();
  SharesFactoryDataSource.create(sharesFactory);
  saveContract(
    sharesFactory.toHex(),
    "SharesFactory",
    "",
    event.block.timestamp,
    event.params.version.toHex()
  );

  let tradingFactory = versionContract.tradingFactory();

  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() == 7271061
  ) {
    TradingFactoryDataSourceV101.create(tradingFactory);
  } else if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 9339586
  ) {
    TradingFactoryDataSourceV1010.create(tradingFactory);
  } else {
    TradingFactoryDataSource.create(tradingFactory);
  }
  saveContract(
    tradingFactory.toHex(),
    "TradingFactory",
    "",
    event.block.timestamp,
    event.params.version.toHex()
  );

  let vaultFactory = versionContract.vaultFactory();
  VaultFactoryDataSource.create(vaultFactory);
  saveContract(
    vaultFactory.toHex(),
    "VaultFactory",
    "",
    event.block.timestamp,
    event.params.version.toHex()
  );
}

export function handleAssetUpsert(event: AssetUpsert): void {
  saveEvent("AssetUpsert", event);

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
    asset.symbol,
    event.block.timestamp,
    event.address.toHex()
  );
}

export function handleAssetRemoval(event: AssetRemoval): void {
  saveEvent("AssetRemoval", event);

  let assetId = event.params.asset.toHex();
  // let registry = Registry.load(event.address.toHex()) as Registry;
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

export function handleExchangeAdapterUpsert(
  event: ExchangeAdapterUpsert
): void {
  saveEvent("ExchangeAdapterUpsert", event);

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
    exchange.name,
    event.block.timestamp,
    event.address.toHex()
  );

  saveContract(
    event.params.exchange.toHex(),
    "Exchange",
    exchange.name,
    event.block.timestamp,
    event.params.adapter.toHex()
  );
}

export function handleExchangeAdapterRemoval(
  event: ExchangeAdapterRemoval
): void {
  saveEvent("ExchangeAdapterRemoval", event);

  let exchangeAdapterId = event.params.exchange.toHex();
  // let registry = Registry.load(event.address.toHex()) as Registry;
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
  saveEvent("EngineChange", event);

  let registry = Registry.load(event.address.toHex());
  if (!registry) {
    return;
  }

  EngineDataSource.create(event.params.engine);
  let engine = engineEntity(event.params.engine.toHex());
  engine.registry = event.address.toHex();
  engine.save();

  registry.engine = engine.id;
  registry.save();

  let state = currentState();
  state.currentEngine = event.params.engine.toHex();
  state.registry = event.address.toHex();
  state.save();

  saveContract(
    engine.id,
    "Engine",
    "",
    event.block.timestamp,
    event.address.toHex()
  );
}

export function handlePriceSourceChange(event: PriceSourceChange): void {
  saveEvent("PriceSourceChange", event);

  PriceSourceDataSource.create(event.params.priceSource);

  let priceSource = new PriceSource(event.params.priceSource.toHex());
  priceSource.registry = event.address.toHex();
  priceSource.save();

  let registry = new Registry(event.address.toHex());
  registry.priceSource = priceSource.id;
  registry.save();

  saveContract(
    priceSource.id,
    "PriceSource",
    "",
    event.block.timestamp,
    event.address.toHex()
  );
}

export function handleMlnTokenChange(event: MlnTokenChange): void {
  saveEvent("MlnTokenChange", event);

  let mlnToken = new MlnToken(event.params.mlnToken.toHex());
  mlnToken.registry = event.address.toHex();
  mlnToken.save();

  saveContract(
    mlnToken.id,
    "MlnToken",
    "",
    event.block.timestamp,
    event.address.toHex()
  );

  let state = currentState();
  state.mlnToken = event.params.mlnToken.toHex();
  state.save();
}

export function handleNativeAssetChange(event: NativeAssetChange): void {
  saveEvent("NativeAssetChange", event);

  let nativeAssset = new NativeAsset(event.params.nativeAsset.toHex());
  nativeAssset.registry = event.address.toHex();
  nativeAssset.save();

  saveContract(
    nativeAssset.id,
    "NativeAsset",
    "",
    event.block.timestamp,
    event.address.toHex()
  );
}

export function handleMGMChange(event: MGMChange): void {
  saveEvent("MGMChange", event);

  let mgm = new MGM(event.params.MGM.toHex());
  mgm.registry = event.address.toHex();
  mgm.save();
}
