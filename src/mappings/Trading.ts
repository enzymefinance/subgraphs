import {
  ExchangeMethodCall,
  TradingContract
} from "../types/templates/TradingDataSource/TradingContract";
import {
  ExchangeMethodCall as ExchangeMethodCallEntity,
  FundHoldingsHistory,
  FundCalculationsHistory,
  Fund,
  Trading
} from "../types/schema";
import { AccountingContract } from "../types/templates/TradingDataSource/AccountingContract";
import { PriceSourceContract } from "../types/templates/TradingDataSource/PriceSourceContract";
import { SharesContract } from "../types/templates/TradingDataSource/SharesContract";
import { saveEventHistory } from "./utils/saveEventHistory";
import { Address } from "@graphprotocol/graph-ts";

export function handleExchangeMethodCall(event: ExchangeMethodCall): void {
  let trading = Trading.load(event.address.toHex());
  if (!trading || !trading.fund) {
    return;
  }

  let fund = Fund.load(trading.fund);
  if (!fund) {
    return;
  }

  let id = event.transaction.hash.toHex();
  let addresses = event.params.orderAddresses.map<string>(value =>
    value.toHex()
  );
  let values = event.params.orderValues;

  let emCall = new ExchangeMethodCallEntity(id);
  emCall.trading = event.address.toHex();
  emCall.exchange = event.params.exchangeAddress.toHex();
  emCall.methodSignature = event.params.methodSignature.toHexString();
  emCall.orderAddress0 = addresses[0];
  emCall.orderAddress1 = addresses[1];
  emCall.orderAddress2 = addresses[2];
  emCall.orderAddress3 = addresses[3];
  emCall.orderAddress4 = addresses[4];
  emCall.orderAddress5 = addresses[5];
  emCall.orderValue0 = values[0];
  emCall.orderValue1 = values[1];
  emCall.orderValue2 = values[2];
  emCall.orderValue3 = values[3];
  emCall.orderValue4 = values[4];
  emCall.orderValue5 = values[5];
  emCall.orderValue6 = values[6];
  emCall.orderValue7 = values[7];
  emCall.makerAssetData = event.params.makerAssetData.toHexString();
  emCall.takerAssetData = event.params.takerAssetData.toHexString();
  emCall.signature = event.params.signature.toHexString();
  emCall.timestamp = event.block.timestamp;
  emCall.save();

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    fund.id,
    "Trading",
    event.address.toHex(),
    "ExchangeMethodCall",
    ["trading"],
    [emCall.trading]
  );

  // calculate fund holdings

  let accountingContract = AccountingContract.bind(
    Address.fromString(fund.accounting)
  );

  let fundGavValid = true;
  let holdings = accountingContract.getFundHoldings();

  let priceSourceContract = PriceSourceContract.bind(
    Address.fromString(fund.priceSource)
  );
  for (let k: i32 = 0; k < holdings.value0.length; k++) {
    let holdingAmount = holdings.value0[k];
    let holdingAddress = holdings.value1[k];

    let holdingsId =
      fund.id +
      "/" +
      event.block.timestamp.toString() +
      "/" +
      holdingAddress.toHex();
    let fundHoldingsHistory = new FundHoldingsHistory(holdingsId);
    fundHoldingsHistory.timestamp = event.block.timestamp;
    fundHoldingsHistory.fund = fund.id;
    fundHoldingsHistory.asset = holdingAddress.toHex();
    fundHoldingsHistory.amount = holdingAmount;

    fundHoldingsHistory.validPrice = priceSourceContract.hasValidPrice(
      holdingAddress
    );
    if (fundHoldingsHistory.validPrice) {
      fundHoldingsHistory.assetGav = accountingContract.calcAssetGAV(
        holdingAddress
      );
    } else {
      fundGavValid = false;
    }

    // only save non-zero values
    if (!holdingAmount.isZero()) {
      fundHoldingsHistory.save();
    }
  }

  // do perform calculations
  if (!fundGavValid) {
    return;
  }

  let calcs = accountingContract.performCalculations();
  let fundGav = calcs.value0;
  let feesInDenomiationAsset = calcs.value1;
  let feesInShares = calcs.value2;
  let nav = calcs.value3;
  let sharePrice = calcs.value4;
  let gavPerShareNetManagementFee = calcs.value5;

  let sharesContract = SharesContract.bind(Address.fromString(fund.share));
  let totalSupply = sharesContract.totalSupply();

  // save price calculation to history
  let calculationsId = fund.id + "/" + event.block.timestamp.toString();
  let calculations = new FundCalculationsHistory(calculationsId);
  calculations.fund = fund.id;
  calculations.timestamp = event.block.timestamp;
  calculations.gav = fundGav;
  calculations.validPrices = fundGavValid;
  calculations.feesInDenominationAsset = feesInDenomiationAsset;
  calculations.feesInShares = feesInShares;
  calculations.nav = nav;
  calculations.sharePrice = sharePrice;
  calculations.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
  calculations.totalSupply = totalSupply;
  calculations.save();

  fund.gav = fundGav;
  fund.validPrice = fundGavValid;
  fund.totalSupply = totalSupply;
  fund.feesInDenominationAsset = feesInDenomiationAsset;
  fund.feesInShares = feesInShares;
  fund.nav = nav;
  fund.sharePrice = sharePrice;
  fund.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
  fund.lastCalculationsUpdate = event.block.timestamp;
  fund.save();
}
