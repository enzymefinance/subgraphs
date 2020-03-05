import { ExchangeMethodCall } from "../../codegen/templates/TradingDataSource/TradingContract";
import {
  ExchangeMethodCall as ExchangeMethodCallEntity,
  FundHoldingsHistory,
  FundCalculationsHistory,
  Fund,
  Trading,
  InvestmentValuationHistory,
  Trade,
  Registry,
  FundHolding
} from "../../codegen/schema";
import {
  AccountingContract,
  AccountingContract__performCalculationsResult
} from "../../codegen/templates/TradingDataSource/AccountingContract";
import { ParticipationContract } from "../../codegen/templates/TradingDataSource/ParticipationContract";
import { RegistryContract } from "../../codegen/templates/TradingDataSource/RegistryContract";
import { PriceSourceContract } from "../../codegen/templates/TradingDataSource/PriceSourceContract";
import { SharesContract } from "../../codegen/templates/TradingDataSource/SharesContract";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { saveEvent } from "../../utils/saveEvent";
import { emptyCalcsObject } from "../../utils/emptyCalcsObject";
import { exchangeMethodSignatureToName } from "../../utils/exchangeMethodSignatureToName";
import { investmentEntity } from "../../entities/investmentEntity";
import { investorValuationHistoryEntity } from "../../entities/investorValuationHistoryEntity";
import { currentState } from "../../utils/currentState";
import { performCalculationsManually } from "../../utils/performCalculationsManually";
import { AccountingContract as CalculationsAccountingContract } from "../../codegen/templates/PriceSourceDataSource/AccountingContract";

export function handleExchangeMethodCall(event: ExchangeMethodCall): void {
  saveEvent("ExchangeMethodCall", event);

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
  emCall.methodName = exchangeMethodSignatureToName(
    event.params.methodSignature.toHexString()
  );
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
  // emCall.makerAssetData = event.params.makerAssetData.toHexString();
  // emCall.takerAssetData = event.params.takerAssetData.toHexString();
  emCall.signature = event.params.signature.toHexString();
  emCall.timestamp = event.block.timestamp;
  emCall.save();

  let takerAsset = addresses[3];
  let makerAsset = addresses[2];

  let takerAssetBeforeTrade = FundHolding.load(fund.id + "/" + takerAsset);
  let takerAmountBeforeTrade = BigInt.fromI32(0);
  if (takerAssetBeforeTrade) {
    takerAmountBeforeTrade = takerAssetBeforeTrade.amount;
  }

  let makerAssetBeforeTrade = FundHolding.load(fund.id + "/" + makerAsset);
  let makerAmountBeforeTrade = BigInt.fromI32(0);
  if (makerAssetBeforeTrade) {
    makerAmountBeforeTrade = makerAssetBeforeTrade.amount;
  }

  // calculate fund holdings
  let state = currentState();
  let currentRegistry = Registry.load(state.registry) as Registry;
  let currentPriceSource = currentRegistry.priceSource;
  if (!currentPriceSource) {
    return;
  }

  let sharesContract = SharesContract.bind(Address.fromString(fund.share));
  let totalSupply = sharesContract.totalSupply();

  let accountingContract = AccountingContract.bind(
    Address.fromString(fund.accounting)
  );

  let fundGavValid = true;
  let assetGav = BigInt.fromI32(0);
  let fundGavFromAssets = BigInt.fromI32(0);
  let holdings = accountingContract.getFundHoldings();

  let registryContract = RegistryContract.bind(
    Address.fromString(fund.registry!)
  );
  let priceSourceContract = PriceSourceContract.bind(
    registryContract.priceSource()
  );

  // delete all current holdings
  fund.holdings = [];
  fund.save();

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
      if (!accountingContract.try_calcAssetGAV(holdingAddress).reverted) {
        assetGav = accountingContract.try_calcAssetGAV(holdingAddress).value;
        fundGavFromAssets = fundGavFromAssets.plus(assetGav);
      }
    } else {
      fundGavValid = false;
    }

    fundHoldingsHistory.assetGav = assetGav;
    fundHoldingsHistory.save();

    if (!holdingAmount.isZero()) {
      let fundHolding = new FundHolding(fund.id + "/" + holdingAddress.toHex());
      fundHolding.fund = fund.id;
      fundHolding.asset = holdingAddress.toHex();
      fundHolding.amount = holdingAmount;
      fundHolding.assetGav = assetGav;
      fundHolding.validPrice = fundHoldingsHistory.validPrice;
      fundHolding.save();

      fund.holdings = fund.holdings.concat([fundHolding.id]);
      fund.save();
    }
  }

  let takerAssetAfterTrade = FundHolding.load(fund.id + "/" + takerAsset);
  let takerAmountAfterTrade = BigInt.fromI32(0);
  if (takerAssetAfterTrade) {
    takerAmountAfterTrade = takerAssetAfterTrade.amount;
  }

  let makerAssetAfterTrade = FundHolding.load(fund.id + "/" + makerAsset);
  let makerAmountAfterTrade = BigInt.fromI32(0);
  if (makerAssetAfterTrade) {
    makerAmountAfterTrade = makerAssetAfterTrade.amount;
  }

  let takerTradeAmount = takerAmountBeforeTrade.minus(takerAmountAfterTrade);
  let makerTradeAmount = makerAmountAfterTrade.minus(makerAmountBeforeTrade);

  let trade = new Trade(id);
  trade.trading = event.address.toHex();
  trade.exchange = event.params.exchangeAddress.toHex();
  trade.methodName = exchangeMethodSignatureToName(
    event.params.methodSignature.toHexString()
  );
  trade.assetSold = takerAsset;
  trade.assetBought = makerAsset;
  trade.amountSold = takerTradeAmount;
  trade.amountBought = makerTradeAmount;
  trade.timestamp = event.block.timestamp;
  trade.save();

  // do perform calculations
  if (!fundGavValid) {
    return;
  }

  let calcs = emptyCalcsObject() as AccountingContract__performCalculationsResult;

  if (fund.priceSource == currentPriceSource) {
    if (accountingContract.try_performCalculations().reverted) {
      calcs = performCalculationsManually(
        fundGavFromAssets,
        totalSupply,
        Address.fromString(fund.feeManager),
        accountingContract as CalculationsAccountingContract
      ) as AccountingContract__performCalculationsResult;
    } else {
      calcs = accountingContract.try_performCalculations().value;
    }
  } else {
    calcs = performCalculationsManually(
      fundGavFromAssets,
      totalSupply,
      Address.fromString(fund.feeManager),
      accountingContract as CalculationsAccountingContract
    ) as AccountingContract__performCalculationsResult;
  }

  let fundGav = calcs.value0;
  let feesInDenomiationAsset = calcs.value1;
  let feesInShares = calcs.value2;
  let nav = calcs.value3;
  let sharePrice = calcs.value4;
  let gavPerShareNetManagementFee = calcs.value5;

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
  calculations.source = "trading";
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

  // valuations for individual investments / investors
  let participationAddress = Address.fromString(fund.participation);
  let participationContract = ParticipationContract.bind(participationAddress);
  let historicalInvestors = participationContract.getHistoricalInvestors();
  for (let l: i32 = 0; l < historicalInvestors.length; l++) {
    let investor = historicalInvestors[l].toHex();

    let investment = investmentEntity(investor, fund.id, event.block.timestamp);

    let investmentGav = BigInt.fromI32(0);
    let investmentNav = BigInt.fromI32(0);
    if (!totalSupply.isZero()) {
      investmentGav = fundGav.times(investment.shares).div(totalSupply);
      investmentNav = nav.times(investment.shares).div(totalSupply);
    }
    investment.gav = investmentGav;
    investment.nav = investmentNav;
    investment.sharePrice = sharePrice;
    investment.save();

    // update investment valuation
    let investmentValuationHistory = new InvestmentValuationHistory(
      investment.id + "/" + event.block.timestamp.toString()
    );
    investmentValuationHistory.investment = investment.id;
    investmentValuationHistory.gav = investmentGav;
    investmentValuationHistory.nav = investmentNav;
    investmentValuationHistory.sharePrice = sharePrice;
    investmentValuationHistory.timestamp = event.block.timestamp;
    investmentValuationHistory.save();

    // update investor valuation
    let investorValuationHistory = investorValuationHistoryEntity(
      investor,
      event.block.timestamp
    );
    investorValuationHistory.gav = investorValuationHistory.gav.plus(
      investmentGav
    );
    investorValuationHistory.nav = investorValuationHistory.nav.plus(
      investmentNav
    );
    investorValuationHistory.timestamp = event.block.timestamp;
    investorValuationHistory.save();
  }
}
