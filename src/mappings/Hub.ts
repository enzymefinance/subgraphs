import { FundShutDown } from "../types/VersionDataSource/templates/HubDataSource/HubContract";
import { Fund, FundCount, State } from "../types/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleFundShutDown(event: FundShutDown): void {
  let fund = Fund.load(event.address.toHex()) as Fund;
  fund.isShutdown = true;
  fund.shutDownTime = event.block.timestamp;
  fund.save();

  // update fund counts
  let state = State.load("0x");
  if (!state) {
    state = new State("0x");
    state.activeFunds = BigInt.fromI32(0);
    state.nonActiveFunds = BigInt.fromI32(0);
    state.timestampFundCount = BigInt.fromI32(0);
  }

  let fundCountUpdate = new FundCount(event.transaction.hash.toHex());
  fundCountUpdate.active = state.activeFunds.minus(BigInt.fromI32(1));
  fundCountUpdate.nonActive = state.nonActiveFunds.plus(BigInt.fromI32(1));
  fundCountUpdate.timestamp = event.block.timestamp;
  fundCountUpdate.save();

  state.activeFunds = fundCountUpdate.active;
  state.nonActiveFunds = fundCountUpdate.nonActive;
  state.timestampFundCount = fundCountUpdate.timestamp;
  state.save();
}
