import { State } from "../codegen/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function currentState(): State {
  let state = State.load("0x");
  if (!state) {
    state = new State("0x");
    state.lastPriceUpdate = BigInt.fromI32(0);
    state.activeFunds = BigInt.fromI32(0);
    state.nonActiveFunds = BigInt.fromI32(0);
    state.timestampFundCount = BigInt.fromI32(0);
    state.numberOfInvestors = BigInt.fromI32(0);
    state.timestamptNumberOfInvestors = BigInt.fromI32(0);
    state.lastEngineUpdate = BigInt.fromI32(0);
    state.totalAmguConsumed = BigInt.fromI32(0);
    state.totalMlnBurned = BigInt.fromI32(0);
    state.mlnToken = "";
    state.registry = "";
    state.registries = [];
    state.networkGav = BigInt.fromI32(0);
    state.save();
  }

  return state as State;
}
