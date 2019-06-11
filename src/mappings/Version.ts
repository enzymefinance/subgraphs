import { NewFund } from "../types/VersionDataSource/VersionContract";
import { HubDataSource } from "../types/VersionDataSource/templates";
import { Fund, FundCount, FundManager } from "../types/schema";
import { hexToAscii } from "./utils/hexToAscii";
import { HubContract } from "../types/VersionDataSource/HubContract";
import { BigInt } from "@graphprotocol/graph-ts";
import { currentState } from "./utils/currentState";
import { saveContract } from "./utils/saveContract";

export function handleNewFund(event: NewFund): void {
  HubDataSource.create(event.params.hub);

  let hub = event.params.hub.toHex();
  let addresses = event.params.routes.map<string>(value => value.toHex());
  let contract = HubContract.bind(event.params.hub);

  let manager = FundManager.load(event.params.manager.toHex());
  if (!manager) {
    manager = new FundManager(event.params.manager.toHex());
    manager.createdAt = event.block.timestamp;
  }
  manager.save();

  let fund = new Fund(hub);
  fund.manager = manager.id;
  fund.name = hexToAscii(contract.name());
  fund.createdAt = contract.creationTime();
  fund.isShutdown = contract.isShutDown();
  fund.accounting = addresses[0];
  fund.feeManager = addresses[1];
  fund.participation = addresses[2];
  fund.policyManager = addresses[3];
  fund.share = addresses[4];
  fund.trading = addresses[5];
  fund.vault = addresses[6];
  fund.registry = addresses[8];
  fund.version = addresses[9];
  fund.engine = addresses[10];
  fund.save();

  saveContract(
    hub,
    "Fund",
    event.block.timestamp,
    event.block.number,
    addresses[9]
  );

  // update fund counts
  let state = currentState();

  let fundCount = new FundCount(event.transaction.hash.toHex());
  if (fund.isShutdown) {
    fundCount.active = state.activeFunds;
    fundCount.nonActive = state.nonActiveFunds.plus(BigInt.fromI32(1));
  } else {
    fundCount.active = state.activeFunds.plus(BigInt.fromI32(1));
    fundCount.nonActive = state.nonActiveFunds;
  }
  fundCount.timestamp = event.block.timestamp;
  fundCount.save();

  state.activeFunds = fundCount.active;
  state.nonActiveFunds = fundCount.nonActive;
  state.timestampFundCount = event.block.timestamp;
  state.save();
}
