import { FundShutDown } from "../codegen/templates/HubDataSource/HubContract";
import { Fund, FundCount } from "../codegen/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { currentState } from "../utils/currentState";
import { saveEvent } from "../utils/saveEvent";

export function handleFundShutDown(event: FundShutDown): void {
  saveEvent("FundShutDown", event);

  let fund = new Fund(event.address.toHex());
  fund.isShutdown = true;
  fund.shutdownAt = event.block.timestamp;
  fund.save();

  // update fund counts
  let state = currentState();

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
