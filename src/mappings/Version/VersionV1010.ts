import { NewFund } from "../../types/templates/VersionDataSourceV1010/VersionContractV1010";
import { HubDataSource } from "../../types/templates";
import {
  Fund,
  FundCount,
  FundManager,
  FundCalculationsHistory,
  Version
} from "../../types/schema";
import { hexToAscii } from "../utils/hexToAscii";
import { HubContract } from "../../types/templates/VersionDataSourceV1010/HubContract";
import { BigInt, Address, dataSource } from "@graphprotocol/graph-ts";
import { currentState } from "../utils/currentState";
import { saveContract } from "../utils/saveContract";
import { AccountingContract } from "../../types/templates/VersionDataSourceV1010/AccountingContract";
import { SharesContract } from "../../types/templates/VersionDataSourceV1010/SharesContract";
import { saveEventHistory } from "../utils/saveEventHistory";

export function handleNewFund(event: NewFund): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7278341
  ) {
    return;
  }

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
  fund.priceSource = addresses[7];
  fund.registry = addresses[8];
  fund.version = addresses[9];
  fund.engine = addresses[10];
  fund.investments = [];
  fund.save();

  let version = Version.load(event.address.toHex()) as Version;
  version.funds = version.funds.concat([fund.id]);
  version.save();

  saveContract(hub, "Hub", fund.name, event.block.timestamp, addresses[9]);

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.params.hub.toHex(),
    "Version",
    event.address.toHex(),
    "NewFund",
    ["hub", "manager"],
    [event.params.hub.toHex(), event.params.manager.toHex()]
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

  // fund calculations

  let accountingAddress = Address.fromString(fund.accounting);
  let accountingContract = AccountingContract.bind(accountingAddress);

  let calcs = accountingContract.performCalculations();
  let fundGav = calcs.value0;
  let feesInDenomiationAsset = calcs.value1;
  let feesInShares = calcs.value2;
  let nav = calcs.value3;
  let sharePrice = calcs.value4;
  let gavPerShareNetManagementFee = calcs.value5;

  let sharesAddress = Address.fromString(fund.share);
  let sharesContract = SharesContract.bind(sharesAddress);
  let totalSupply = sharesContract.totalSupply();

  // save price calculation to history
  let calculationsId = fund.id + "/" + event.block.timestamp.toString();
  let calculations = new FundCalculationsHistory(calculationsId);
  calculations.fund = fund.id;
  calculations.timestamp = event.block.timestamp;
  calculations.gav = fundGav;
  calculations.feesInDenominationAsset = feesInDenomiationAsset;
  calculations.feesInShares = feesInShares;
  calculations.nav = nav;
  calculations.sharePrice = sharePrice;
  calculations.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
  calculations.totalSupply = totalSupply;
  calculations.source = "fundCreation";
  calculations.save();

  fund.gav = fundGav;
  fund.totalSupply = totalSupply;
  fund.feesInDenominationAsset = feesInDenomiationAsset;
  fund.feesInShares = feesInShares;
  fund.nav = nav;
  fund.sharePrice = sharePrice;
  fund.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
  fund.lastCalculationsUpdate = event.block.timestamp;
  fund.currentDailySharePrice = BigInt.fromI32(0);
  fund.previousDailySharePrice = sharePrice;
  fund.save();
}
