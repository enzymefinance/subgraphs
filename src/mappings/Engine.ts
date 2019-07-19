import {
  SetAmguPrice,
  RegistryChange,
  AmguPaid,
  Thaw,
  Burn,
  EngineContract
} from "../types/EngineDataSource/EngineContract";
import {
  AmguPrice,
  AmguPayment,
  EngineEtherEvent,
  Registry,
  Engine,
  EngineHistory
} from "../types/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { saveContract } from "./utils/saveContract";
import { currentState } from "./utils/currentState";

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

function registryEntity(address: Address): Registry {
  let id = address.toHex();
  let registry = Registry.load(id);

  if (!registry) {
    registry = new Registry(id);
    registry.versions = [];
    registry.assets = [];
    registry.save();
  }

  return registry as Registry;
}

export function handleSetAmguPrice(event: SetAmguPrice): void {
  let amguPrice = new AmguPrice(event.transaction.hash.toHex());
  amguPrice.price = event.params.amguPrice;
  amguPrice.engine = event.address.toHex();
  amguPrice.timestamp = event.block.timestamp;
  amguPrice.save();

  let engine = Engine.load(event.address.toHex());
  if (engine) {
    engine.amguPrice = event.params.amguPrice;
    engine.save();
  }
}

export function handleAmguPaid(event: AmguPaid): void {
  let amguPayment = new AmguPayment(event.transaction.hash.toHex());
  amguPayment.amount = event.params.amount;
  amguPayment.engine = event.address.toHex();
  amguPayment.timestamp = event.block.timestamp;
  amguPayment.save();

  // update current engine state
  let engine = Engine.load(event.address.toHex()) as Engine;
  engine.totalAmguConsumed = engine.totalAmguConsumed!.plus(
    event.params.amount
  );
  engine.lastUpdate = event.block.timestamp;
  engine.save();

  // Update all engine quantities at most once per day.
  let state = currentState();
  let interval = BigInt.fromI32(24 * 60 * 60);
  if (event.block.timestamp.minus(state.lastEngineUpdate).gt(interval)) {
    state.lastEngineUpdate = event.block.timestamp;
    state.save();

    let engineContract = EngineContract.bind(event.address);
    engine.amguPrice = engineContract.amguPrice();
    engine.frozenEther = engineContract.frozenEther();
    engine.liquidEther = engineContract.liquidEther();
    engine.lastThaw = engineContract.lastThaw();
    engine.thawingDelay = engineContract.thawingDelay();
    engine.totalEtherConsumed = engineContract.totalEtherConsumed();
    engine.totalAmguConsumed = engineContract.totalAmguConsumed();
    engine.totalMlnBurned = engineContract.totalMlnBurned();
    engine.premiumPercent = engineContract.premiumPercent();
    engine.lastUpdate = event.block.timestamp;
    engine.save();

    let engineHistory = new EngineHistory(
      event.address.toHex() + "/" + event.block.timestamp.toString()
    );
    engineHistory.amguPrice = engineContract.amguPrice();
    engineHistory.frozenEther = engineContract.frozenEther();
    engineHistory.liquidEther = engineContract.liquidEther();
    engineHistory.lastThaw = engineContract.lastThaw();
    engineHistory.thawingDelay = engineContract.thawingDelay();
    engineHistory.totalEtherConsumed = engineContract.totalEtherConsumed();
    engineHistory.totalAmguConsumed = engineContract.totalAmguConsumed();
    engineHistory.totalMlnBurned = engineContract.totalMlnBurned();
    engineHistory.premiumPercent = engineContract.premiumPercent();
    engineHistory.timestamp = event.block.timestamp;
    engineHistory.engine = event.address.toHex();
    engineHistory.save();
  }
}

export function handleThaw(event: Thaw): void {
  let etherEvent = new EngineEtherEvent(event.transaction.hash.toHex());
  etherEvent.event = "Thaw";
  etherEvent.amount = event.params.amount;
  etherEvent.engine = event.address.toHex();
  etherEvent.timestamp = event.block.timestamp;
  etherEvent.save();

  let engineContract = EngineContract.bind(event.address);

  let engine = Engine.load(event.address.toHex()) as Engine;
  engine.lastThaw = event.block.timestamp;
  engine.liquidEther = engineContract.liquidEther();
  engine.save();
}

export function handleBurn(event: Burn): void {
  let etherEvent = new EngineEtherEvent(event.transaction.hash.toHex());
  etherEvent.event = "Burn";
  etherEvent.amount = event.params.amount;
  etherEvent.engine = event.address.toHex();
  etherEvent.timestamp = event.block.timestamp;
  etherEvent.save();

  let engineContract = EngineContract.bind(event.address);
  let engine = Engine.load(event.address.toHex()) as Engine;
  engine.liquidEther = engineContract.liquidEther();
  engine.totalMlnBurned = engineContract.totalMlnBurned();
  engine.totalEtherConsumed = engineContract.totalEtherConsumed();
  engine.save();
}

export function handleRegistryChange(event: RegistryChange): void {
  let registry = registryEntity(event.params.registry);
  let engine = engineEntity(event.address, event.params.registry);
  engine.registry = registry.id;
  engine.save();

  saveContract(
    registry.id,
    "Registry",
    event.block.timestamp,
    event.block.number,
    engine.id
  );
}
