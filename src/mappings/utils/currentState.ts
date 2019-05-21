import { State } from "../../types/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function currentState(): State {
  let state = State.load("0x");
  if (!state) {
    state = new State("0x");
    state.lastCalculation = BigInt.fromI32(0);
    state.activeFunds = BigInt.fromI32(0);
    state.nonActiveFunds = BigInt.fromI32(0);
    state.timestampFundCount = BigInt.fromI32(0);
    state.save();
  }

  return state as State;
}
