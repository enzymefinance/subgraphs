import { Address, BigInt, log, BigDecimal } from "@graphprotocol/graph-ts";
import {
  PriceUpdate,
  PriceSourceContract
} from "../types/PriceSourceDataSource/PriceSourceContract";
import {
  Fund,
  Asset,
  AssetPriceUpdate,
  FundCalculationsUpdate,
  FundHoldingsLog,
  AggregateValue,
  InvestmentValuationLog
} from "../types/schema";
import { AccountingContract } from "../types/PriceSourceDataSource/AccountingContract";
import { VersionContract } from "../types/PriceSourceDataSource/VersionContract";
import { currentState } from "./utils/currentState";
import { versionAddress } from "../statics";
import { RegistryContract } from "../types/PriceSourceDataSource/RegistryContract";
import { SharesContract } from "../types/PriceSourceDataSource/SharesContract";
import { ParticipationContract } from "../types/PriceSourceDataSource/ParticipationContract";
import { investmentEntity } from "./entities/investmentEntity";

function updateAssetPrices(event: PriceUpdate): void {
  let prices = event.params.price;
  let tokens = event.params.token;

  for (let i: i32 = 0; i < prices.length; i++) {
    let asset = Asset.load(tokens[i].toHex());
    if (!asset) {
      continue;
    }

    let id = event.transaction.hash.toHex() + "/" + asset.id;
    let price = new AssetPriceUpdate(id);
    price.asset = asset.id;
    price.price = prices[i];
    price.timestamp = event.block.timestamp;
    price.save();

    asset.price = prices[i];
    asset.lastPriceUpdate = event.block.timestamp;
    asset.save();
  }
}

function updateFundCalculations(event: PriceUpdate): void {
  let priceSourceContract = PriceSourceContract.bind(event.address);
  let registryAddress = priceSourceContract.REGISTRY();
  let registryContract = RegistryContract.bind(registryAddress);
  let versions = registryContract.getRegisteredVersions();

  let aggregateGAV = BigInt.fromI32(0);

  for (let i: i32 = 0; i < versions.length; i++) {
    // Don't run for early trial versions (no funds)
    if (
      versions[i].toHex() ==
        Address.fromString(
          "0x07ed984b46ff6789ba30b75b5f4690b9f15464d4"
        ).toHex() ||
      versions[i].toHex() ==
        Address.fromString("0xf1d376db5ed16d183a962eaa719a58773fba5dff").toHex()
    ) {
      continue;
    }

    // Only update at most once an hour.
    // let state = currentState();
    // let interval = BigInt.fromI32(3600);
    // if (event.block.timestamp.minus(state.lastCalculation).gt(interval)) {
    // state.lastCalculation = event.block.timestamp;

    let versionContract = VersionContract.bind(versions[i]);
    let lastFundId = versionContract.getLastFundId();

    // Bail out if max uint256  was returned (why???)
    let maxUint256 =
      "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    if (lastFundId.toString() == maxUint256) {
      log.warning("Last Fund id returned {}", [lastFundId.toString()]);
      continue;
    }

    // Bail out if no fund has been registered yet.
    if (lastFundId.lt(BigInt.fromI32(0))) {
      continue;
    }

    for (let j: i32 = 0; j < lastFundId.toI32(); j++) {
      let fundAddress = versionContract.getFundById(BigInt.fromI32(j)).toHex();
      let fund = Fund.load(fundAddress);
      if (!fund) {
        continue;
      }

      // log.warning("Updating price for fund {} under version {}", [
      //   fund.name,
      //   versions[i].toHex()
      // ]);

      // if (fund.isShutdown) {
      //   continue;
      // }

      let accountingAddress = Address.fromString(fund.accounting);
      let accountingContract = AccountingContract.bind(accountingAddress);
      // let values = accountingContract.performCalculations();

      let gav = accountingContract.calcGav();

      const outlier =
        "3963877391197344453575983046348115674221700746820753546331534351508065746944";
      if (gav.toString() == outlier) {
        log.warning("Found outlier! Gav {}", [gav.toString()]);
        continue;
      }
      aggregateGAV = aggregateGAV.plus(gav);

      let sharesAddress = Address.fromString(fund.shares);
      let sharesContract = SharesContract.bind(sharesAddress);
      let totalSuppy = sharesContract.totalSupply();

      let grossSharePrice = BigDecimal.fromString("0");
      if (!totalSuppy.isZero()) {
        grossSharePrice = gav.toBigDecimal().div(totalSuppy.toBigDecimal());
      }

      let timestamp = event.block.timestamp;
      let calculationsId = fundAddress + "/" + timestamp.toString();
      let calculations = new FundCalculationsUpdate(calculationsId);
      calculations.fund = fundAddress;
      calculations.timestamp = timestamp;
      calculations.gav = gav;
      // calculations.feesInDenominationAsset = values.value1;
      // calculations.feesInShares = values.value2;
      // calculations.nav = values.value3;
      // calculations.sharePrice = values.value4;
      // calculations.gavPerShareNetManagementFee = values.value5;
      calculations.totalSupply = totalSuppy;
      calculations.grossSharePrice = grossSharePrice;
      calculations.save();

      fund.gav = gav;
      fund.totalSupply = totalSuppy;
      fund.grossSharePrice = grossSharePrice;
      // fund.feesInDenominationAsset = values.value1;
      // fund.feesInShares = values.value2;
      // fund.nav = values.value3;
      // fund.sharePrice = values.value4;
      // fund.gavPerShareNetManagementFee = values.value5;
      fund.lastCalculationsUpdate = timestamp;
      fund.save();

      let holdings = accountingContract.getFundHoldings();

      for (let k: i32 = 0; k < holdings.value0.length; k++) {
        let holdingsId =
          fundAddress +
          "/" +
          timestamp.toString() +
          "/" +
          holdings.value1[k].toHex();
        let fundHoldingsLog = new FundHoldingsLog(holdingsId);
        fundHoldingsLog.timestamp = timestamp;
        fundHoldingsLog.fund = fundAddress;
        fundHoldingsLog.asset = holdings.value1[k].toHex();
        fundHoldingsLog.holding = holdings.value0[k];
        fundHoldingsLog.save();
      }

      let participationAddress = Address.fromString(fund.participation);
      let participationContract = ParticipationContract.bind(
        participationAddress
      );
      let historicalInvestors = participationContract.getHistoricalInvestors();

      for (let l: i32 = 0; l < historicalInvestors.length; l++) {
        let investor = historicalInvestors[l];
        let investment = investmentEntity(
          investor,
          Address.fromString(fundAddress)
        );

        let value = grossSharePrice.times(investment.shares.toBigDecimal());
        let investmentValuationLog = new InvestmentValuationLog(
          investment.id + "/" + event.block.timestamp.toString()
        );
        investmentValuationLog.investment = investment.id;
        investmentValuationLog.gav = value;
        investmentValuationLog.timestamp = event.block.timestamp;
        investmentValuationLog.save();

        investment.gav = value;
        investment.save();
      }
    }

    // state.save();
    // }
  }
  let aggregateValue = new AggregateValue(event.block.timestamp.toString());
  aggregateValue.timestamp = event.block.timestamp;
  aggregateValue.gav = aggregateGAV;
  aggregateValue.save();
}

export function handlePriceUpdate(event: PriceUpdate): void {
  updateAssetPrices(event);
  updateFundCalculations(event);
}
