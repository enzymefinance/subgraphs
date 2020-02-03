import { BigInt } from "@graphprotocol/graph-ts";

import { Engine } from "../codegen/schema";

export function engineEntity(id: string): Engine {
  let engine = Engine.load(id);

  if (!engine) {
    engine = new Engine(id);
    engine.registry = "";
    engine.amguPrice = BigInt.fromI32(0);
    engine.frozenEther = BigInt.fromI32(0);
    engine.liquidEther = BigInt.fromI32(0);
    engine.lastThaw = BigInt.fromI32(0);
    engine.thawingDelay = BigInt.fromI32(0);
    engine.totalEtherConsumed = BigInt.fromI32(0);
    engine.totalAmguConsumed = BigInt.fromI32(0);
    engine.totalMlnBurned = BigInt.fromI32(0);
    engine.premiumPercent = BigInt.fromI32(0);
    engine.mlnTotalSupply = BigInt.fromI32(0);
    engine.lastUpdate = BigInt.fromI32(0);
    engine.save();
  }

  return engine as Engine;
}
