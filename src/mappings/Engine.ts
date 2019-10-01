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
  Engine,
  EngineHistory
} from "../types/schema";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { saveContract } from "./utils/saveContract";
import { currentState } from "./utils/currentState";
import { MlnContract } from "../types/EngineDataSource/MlnContract";
import { engineEntity } from "./entities/engineEntity";

export function handleSetAmguPrice(event: SetAmguPrice): void {
  let amguPrice = new AmguPrice(event.transaction.hash.toHex());
  amguPrice.price = event.params.amguPrice;
  amguPrice.engine = event.address.toHex();
  amguPrice.timestamp = event.block.timestamp;
  amguPrice.save();

  let engine = engineEntity(event.address.toHex());
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

  // update current engine state (amguConsumed, frozenEther)
  let engineContract = EngineContract.bind(event.address);

  let engine = engineEntity(event.address.toHex());
  engine.totalAmguConsumed = engine.totalAmguConsumed!.plus(
    event.params.amount
  );
  engine.frozenEther = engineContract.frozenEther();
  engine.totalEtherConsumed = engineContract.totalEtherConsumed();
  engine.lastUpdate = event.block.timestamp;
  engine.save();

  // Update all engine quantities every hour
  let state = currentState();
  let interval = BigInt.fromI32(60 * 60);
  if (event.block.timestamp.minus(state.lastEngineUpdate).gt(interval)) {
    state.lastEngineUpdate = event.block.timestamp;
    state.save();

    if (state.mlnToken == "") {
      return;
    }
    let mlnContract = MlnContract.bind(
      Address.fromString(state.mlnToken as string)
    );

    engine.amguPrice = engineContract.amguPrice();
    engine.liquidEther = engineContract.liquidEther();
    engine.lastThaw = engineContract.lastThaw();
    engine.thawingDelay = engineContract.thawingDelay();
    engine.totalAmguConsumed = engineContract.totalAmguConsumed();
    engine.totalMlnBurned = engineContract.totalMlnBurned();
    engine.premiumPercent = engineContract.premiumPercent();
    engine.mlnTotalSupply = mlnContract.try_totalSupply().reverted
      ? BigInt.fromI32(0)
      : mlnContract.try_totalSupply().value;
    engine.save();

    let engineHistory = new EngineHistory(
      event.address.toHex() + "/" + event.block.timestamp.toString()
    );
    engineHistory.amguPrice = engine.amguPrice;
    engineHistory.frozenEther = engine.frozenEther;
    engineHistory.liquidEther = engine.liquidEther;
    engineHistory.lastThaw = engine.lastThaw;
    engineHistory.thawingDelay = engine.thawingDelay;
    engineHistory.totalEtherConsumed = engine.totalEtherConsumed;
    engineHistory.totalAmguConsumed = engine.totalAmguConsumed;
    engineHistory.totalMlnBurned = engine.totalMlnBurned;
    engineHistory.premiumPercent = engine.premiumPercent;
    engineHistory.mlnTotalSupply = engine.mlnTotalSupply;
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

  let engine = engineEntity(event.address.toHex()) as Engine;
  engine.lastThaw = event.block.timestamp;
  engine.liquidEther = engineContract.liquidEther();
  engine.frozenEther = engineContract.frozenEther();
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
  let engine = engineEntity(event.address.toHex()) as Engine;
  engine.liquidEther = engineContract.liquidEther();
  engine.totalMlnBurned = engineContract.totalMlnBurned();
  engine.totalEtherConsumed = engineContract.totalEtherConsumed();
  engine.save();
}

export function handleRegistryChange(event: RegistryChange): void {
  let engine = engineEntity(event.address.toHex());
  engine.registry = event.params.registry.toHex();
  engine.save();

  saveContract(
    event.address.toHex(),
    "Engine",
    "",
    event.block.timestamp,
    event.params.registry.toHex()
  );
}
