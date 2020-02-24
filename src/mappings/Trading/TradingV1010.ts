import {
  ExchangeMethodCall,
  TradingContractV1010
} from "../../codegen/templates/TradingDataSourceV1010/TradingContractV1010";
import {
  ExchangeMethodCall as ExchangeMethodCallEntity,
  FundCalculationsHistory,
  FundHoldingsHistory,
  Fund,
  Trading,
  InvestmentValuationHistory
} from "../../codegen/schema";
import {
  AccountingContract,
  AccountingContract__performCalculationsResult
} from "../../codegen/templates/TradingDataSourceV1010/AccountingContract";
import { ParticipationContract } from "../../codegen/templates/TradingDataSourceV1010/ParticipationContract";
import { RegistryContract } from "../../codegen/templates/TradingDataSourceV1010/RegistryContract";
import { PriceSourceContract } from "../../codegen/templates/TradingDataSourceV1010/PriceSourceContract";
import { SharesContract } from "../../codegen/templates/TradingDataSourceV1010/SharesContract";
import { saveEvent } from "../../utils/saveEvent";
import { emptyCalcsObject } from "../../utils/emptyCalcsObject";
import { exchangeMethodSignatureToName } from "../../utils/exchangeMethodSignatureToName";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { investmentEntity } from "../../entities/investmentEntity";
import { investorValuationHistoryEntity } from "../../entities/investorValuationHistoryEntity";

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
  emCall.orderAddress1 = addresses[1]; // trading contract
  emCall.orderAddress2 = addresses[2]; // taker asset token
  emCall.orderAddress3 = addresses[3]; // maker asset token
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

  let tradingContract = TradingContractV1010.bind(event.address);
  let routes = tradingContract.routes();

  let hub = tradingContract.hub();
  let fundAddress = hub.toHex();

  // calculate fund holdings

  let accountingContract = AccountingContract.bind(routes.value0);

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
  for (let k: i32 = 0; k < holdings.value0.length; k++) {
    let holdingAmount = holdings.value0[k];
    let holdingAddress = holdings.value1[k];

    let holdingsId =
      fundAddress +
      "/" +
      event.block.timestamp.toString() +
      "/" +
      holdingAddress.toHex();
    let fundHoldingsHistory = new FundHoldingsHistory(holdingsId);
    fundHoldingsHistory.timestamp = event.block.timestamp;
    fundHoldingsHistory.fund = fundAddress;
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

    // only save non-zero values
    // if (!holdingAmount.isZero()) {
    //   fundHoldingsHistory.save();
    // }
  }

  // do perform calculations
  if (!fundGavValid) {
    return;
  }

  let calcs = emptyCalcsObject() as AccountingContract__performCalculationsResult;

  if (!accountingContract.try_performCalculations().reverted) {
    calcs = accountingContract.try_performCalculations().value;
  }
  let fundGav = calcs.value0;
  let feesInDenomiationAsset = calcs.value1;
  let feesInShares = calcs.value2;
  let nav = calcs.value3;
  let sharePrice = calcs.value4;
  let gavPerShareNetManagementFee = calcs.value5;

  let sharesContract = SharesContract.bind(routes.value4);
  let totalSupply = sharesContract.totalSupply();

  // save price calculation to history
  let calculationsId = fundAddress + "/" + event.block.timestamp.toString();
  let calculations = new FundCalculationsHistory(calculationsId);
  calculations.fund = fundAddress;
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
