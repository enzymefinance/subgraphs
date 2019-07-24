import { FundShutDown } from "../types/VersionDataSource/templates/HubDataSource/HubContract";
import { Fund, FundCount, State } from "../types/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { currentState } from "./utils/currentState";
import { saveEventHistory } from "./utils/saveEventHistory";

export function handleFundShutDown(event: FundShutDown): void {
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

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.address.toHex(),
    "Hub",
    event.address.toHex(),
    "FundShutDown",
    [],
    []
  );
}
