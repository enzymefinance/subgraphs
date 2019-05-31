import { Address, BigInt, BigDecimal, log } from "@graphprotocol/graph-ts";
import {
  PriceUpdate,
  PriceSourceContract
} from "../types/PriceSourceDataSource/PriceSourceContract";
import {
  Fund,
  Asset,
  AssetPriceHistory,
  FundHoldingsHistory,
  NetworkValue,
  InvestmentValuationHistory,
  FundCalculationsHistory
} from "../types/schema";
import { AccountingContract } from "../types/PriceSourceDataSource/AccountingContract";
import { VersionContract } from "../types/PriceSourceDataSource/VersionContract";
import { RegistryContract } from "../types/PriceSourceDataSource/RegistryContract";
import { SharesContract } from "../types/PriceSourceDataSource/SharesContract";
import { ParticipationContract } from "../types/PriceSourceDataSource/ParticipationContract";
import { investmentEntity } from "./entities/investmentEntity";
import { investorValuationHistoryEntity } from "./entities/investorValuationHistoryEntity";
import { currentState } from "./utils/currentState";
import { FeeManagerContract } from "../types/PriceSourceDataSource/FeeManagerContract";

function updateAssetPrices(event: PriceUpdate): void {
  let prices = event.params.price;
  let tokens = event.params.token;

  for (let i: i32 = 0; i < prices.length; i++) {
    let asset = Asset.load(tokens[i].toHex());
    if (!asset) {
      continue;
    }

    asset.price = prices[i];
    asset.lastPriceUpdate = event.block.timestamp;
    asset.save();

    let id = asset.id + "/" + event.block.timestamp.toString();
    let priceUpdate = new AssetPriceHistory(id);
    priceUpdate.asset = asset.id;
    priceUpdate.price = prices[i];
    priceUpdate.timestamp = event.block.timestamp;
    priceUpdate.save();
  }
}

function updateFundCalculations(event: PriceUpdate): void {
  // if we skip 7560279, then it fails at 7566765...
  // if (event.block.number.equals(BigInt.fromI32(7560279))) {
  //   log.warning("Skipping block 7560279", []);
  //   return;
  // }

  // Only update at most once per day
  // (interval is set to 23 hours because priceUpdate is not as regular as it should be...)
  let state = currentState();
  let interval = BigInt.fromI32(23 * 3600);
  if (event.block.timestamp.minus(state.lastPriceUpdate).gt(interval)) {
    state.lastPriceUpdate = event.block.timestamp;

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
          Address.fromString(
            "0xf1d376db5ed16d183a962eaa719a58773fba5dff"
          ).toHex()
      ) {
        continue;
      }

      let versionContract = VersionContract.bind(versions[i]);
      let lastFundId = versionContract.getLastFundId();

      // Bail out if max uint256  was returned (why???)
      let maxUint256 =
        "115792089237316195423570985008687907853269984665640564039457584007913129639935";
      if (lastFundId.toString() == maxUint256) {
        continue;
      }

      // Bail out if no fund has been registered yet.
      if (lastFundId.lt(BigInt.fromI32(0))) {
        continue;
      }

      for (let j: i32 = 0; j <= lastFundId.toI32(); j++) {
        let fundAddress = versionContract
          .getFundById(BigInt.fromI32(j))
          .toHex();
        let fund = Fund.load(fundAddress) || new Fund(fundAddress);
        // if (!fund) {
        //   continue;
        // }

        // if (fund.isShutdown) {
        //   continue;
        // }

        let accountingAddress = Address.fromString(fund.accounting);
        let accountingContract = AccountingContract.bind(accountingAddress);
        // let values = accountingContract.performCalculations();

        // this is doing performCalculations manually, because performCalculations
        // is not reliable!!!!
        // .... from here
        let gav = accountingContract.calcGav();

        const outlier =
          "3963877391197344453575983046348115674221700746820753546331534351508065746944";
        if (gav.toString() == outlier) {
          continue;
        }
        aggregateGAV = aggregateGAV.plus(gav);

        let sharesAddress = Address.fromString(fund.shares);
        let sharesContract = SharesContract.bind(sharesAddress);
        let totalSupply = sharesContract.totalSupply();

        let feeManagerAddress = Address.fromString(fund.feeManager);
        let feeManagerContract = FeeManagerContract.bind(feeManagerAddress);
        let feesInShares = feeManagerContract.totalFeeAmount();

        let feesInDenomiationAsset = BigInt.fromI32(0);
        if (!totalSupply.isZero()) {
          feesInDenomiationAsset = gav
            .times(feesInShares)
            .div(totalSupply.plus(feesInShares));
        }

        let nav = gav.minus(feesInDenomiationAsset);

        let totalSupplyAccountingForFees = totalSupply.plus(feesInShares);
        let sharePrice = BigInt.fromI32(0);
        let gavPerShareNetManagementFee = BigInt.fromI32(0);
        let managementFeeAmount = feeManagerContract.managementFeeAmount();

        let defaultSharePrice = accountingContract.DEFAULT_SHARE_PRICE();
        if (!totalSupply.isZero()) {
          sharePrice = gav
            .times(defaultSharePrice)
            .div(totalSupplyAccountingForFees);
          gavPerShareNetManagementFee = gav
            .times(defaultSharePrice)
            .div(totalSupply.plus(managementFeeAmount));
        } else {
          sharePrice = defaultSharePrice;
          gavPerShareNetManagementFee = defaultSharePrice;
        }
        // until here....

        let timestamp = event.block.timestamp;
        let calculationsId = fundAddress + "/" + timestamp.toString();
        let calculations = new FundCalculationsHistory(calculationsId);
        calculations.fund = fundAddress;
        calculations.timestamp = timestamp;
        calculations.gav = gav;
        calculations.feesInDenominationAsset = feesInDenomiationAsset;
        calculations.feesInShares = feesInShares;
        calculations.nav = nav;
        calculations.sharePrice = sharePrice;
        calculations.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
        calculations.totalSupply = totalSupply;
        calculations.save();

        fund.gav = gav;
        fund.totalSupply = totalSupply;
        fund.feesInDenominationAsset = feesInDenomiationAsset;
        fund.feesInShares = feesInShares;
        fund.nav = nav;
        fund.sharePrice = sharePrice;
        fund.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
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
          let fundHoldingsHistory = new FundHoldingsHistory(holdingsId);
          fundHoldingsHistory.timestamp = timestamp;
          fundHoldingsHistory.fund = fundAddress;
          fundHoldingsHistory.asset = holdings.value1[k].toHex();
          fundHoldingsHistory.holding = holdings.value0[k];

          let assetGav = BigInt.fromI32(0);
          if (!holdings.value0[k].isZero()) {
            assetGav = accountingContract.calcAssetGAV(holdings.value1[k]);
          }
          fundHoldingsHistory.assetGav = assetGav;
          fundHoldingsHistory.save();
        }

        let participationAddress = Address.fromString(fund.participation);
        let participationContract = ParticipationContract.bind(
          participationAddress
        );
        let historicalInvestors = participationContract.getHistoricalInvestors();

        // valuations for individual investments / investors
        for (let l: i32 = 0; l < historicalInvestors.length; l++) {
          let investor = historicalInvestors[l];
          let investment = investmentEntity(
            investor,
            Address.fromString(fundAddress)
          );

          let investmentGav = BigInt.fromI32(0);
          let investmentNav = BigInt.fromI32(0);
          if (!totalSupply.isZero()) {
            investmentGav = gav.times(investment.shares).div(totalSupply);
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
          let investorValuationHistoryId =
            investor.toHex() + "/" + event.block.timestamp.toString();
          let investorValuationLog = investorValuationHistoryEntity(
            investor,
            investorValuationHistoryId
          );
          investorValuationLog.gav = investorValuationLog.gav.plus(
            investmentGav
          );
          if (!investorValuationLog.nav) {
            investorValuationLog.nav = BigInt.fromI32(0);
          }
          investorValuationLog.nav = investorValuationLog.nav.plus(
            investmentNav
          );
          investorValuationLog.timestamp = event.block.timestamp;
          investorValuationLog.save();
        }
      }
    }
    let networkValue = new NetworkValue(event.block.timestamp.toString());
    networkValue.timestamp = event.block.timestamp;
    networkValue.gav = aggregateGAV;
    networkValue.save();

    state.save();
  }
}

export function handlePriceUpdate(event: PriceUpdate): void {
  updateAssetPrices(event);
  updateFundCalculations(event);
}
