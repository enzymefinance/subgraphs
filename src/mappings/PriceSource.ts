import { Address, BigInt, TypedMap, log } from "@graphprotocol/graph-ts";
import {
  PriceSourceContract,
  PriceUpdate
} from "../types/PriceSourceDataSource/PriceSourceContract";
import {
  Fund,
  Asset,
  FundHoldingsHistory,
  InvestmentValuationHistory,
  FundCalculationsHistory,
  AssetPriceUpdate,
  AssetPriceHistory,
  MelonNetworkHistory
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

// helper function because graph-ts doesn't have a bigInt.power() function
function tenToThePowerOf(exponent: BigInt): BigInt {
  let result = BigInt.fromI32(1);
  for (let i: i32 = 0; i < exponent.toI32(); i++) {
    result = result.times(BigInt.fromI32(10));
  }
  return result;
}

export function handlePriceUpdate(event: PriceUpdate): void {
  // Only update at most once per day (roughly)
  let timestamp = event.block.timestamp;
  let state = currentState();
  let interval = BigInt.fromI32(23 * 3600);
  if (event.block.timestamp.minus(state.lastPriceUpdate).lt(interval)) {
    return;
  }

  let prices = event.params.price;
  let tokens = event.params.token;

  // AssetPriceUpdate entity groups all asset prices belonging to one timestamp
  let priceUpdate = new AssetPriceUpdate(event.block.timestamp.toString());
  priceUpdate.timestamp = event.block.timestamp;
  priceUpdate.priceSource = event.address.toHex();
  priceUpdate.numberOfAssets = 0;
  priceUpdate.invalidPrices = 0;
  priceUpdate.save();

  // save prices to prevent contract calls for individual funds
  let assetPriceMap = new TypedMap<string, BigInt>();
  let assetDecimalMap = new TypedMap<string, BigInt>();

  let numberOfAssets = 0;
  let invalidPrices = 0;
  for (let i: i32 = 0; i < prices.length; i++) {
    let asset = Asset.load(tokens[i].toHex());
    if (!asset) {
      continue;
    }

    // identify invalid prices
    // (they are set to 0 by the contract event emitter)
    let priceValid = true;
    if (prices[i].isZero()) {
      priceValid = false;
      invalidPrices = invalidPrices + 1;
    }

    asset.lastPrice = prices[i];
    asset.lastPriceUpdate = event.block.timestamp;
    asset.lastPriceValid = priceValid;
    asset.save();

    // save to asset price history
    let id = asset.id + "/" + event.block.timestamp.toString();
    let assetPriceHistory = new AssetPriceHistory(id);
    assetPriceHistory.priceUpdate = event.block.timestamp.toString();
    assetPriceHistory.asset = asset.id;
    assetPriceHistory.price = prices[i];
    assetPriceHistory.priceValid = priceValid;
    assetPriceHistory.timestamp = event.block.timestamp;
    assetPriceHistory.save();

    numberOfAssets = numberOfAssets + 1;

    assetPriceMap.set(tokens[i].toHex(), prices[i]);
    assetDecimalMap.set(tokens[i].toHex(), BigInt.fromI32(asset.decimals));
  }

  priceUpdate.numberOfAssets = numberOfAssets;
  priceUpdate.invalidPrices = invalidPrices;
  priceUpdate.save();

  state.lastPriceUpdate = event.block.timestamp;
  state.save();

  // update values for all funds in all deployed versions
  let priceSourceContract = PriceSourceContract.bind(event.address);
  let registryAddress = priceSourceContract.REGISTRY();

  let registryContract = RegistryContract.bind(registryAddress);
  let versions = registryContract.getRegisteredVersions();

  let melonNetworkGAV = BigInt.fromI32(0);

  for (let i: i32 = 0; i < versions.length; i++) {
    // Don't run for early trial versions (which contain no funds)
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

    // loop through all funds
    for (let j: i32 = 0; j <= lastFundId.toI32(); j++) {
      let fundAddress = versionContract.getFundById(BigInt.fromI32(j)).toHex();
      let fund = Fund.load(fundAddress) as Fund;
      if (!fund) {
        continue;
      }

      let accountingAddress = Address.fromString(fund.accounting);
      let accountingContract = AccountingContract.bind(accountingAddress);

      // fund holdings, incl. finding out if there holdings with invalid prices
      //
      // this is to prevent calling calcGav and performCalculations in the Accounting contract
      // directly, as those functions are unreliable (they fail if prices don't exist)
      //
      let fundGavValid = true;
      let holdings = accountingContract.getFundHoldings();

      for (let k: i32 = 0; k < holdings.value0.length; k++) {
        let holdingAmount = holdings.value0[k];
        let holdingAddress = holdings.value1[k];

        let holdingsId =
          fundAddress +
          "/" +
          timestamp.toString() +
          "/" +
          holdingAddress.toHex();
        let fundHoldingsHistory = new FundHoldingsHistory(holdingsId);
        fundHoldingsHistory.timestamp = timestamp;
        fundHoldingsHistory.fund = fundAddress;
        fundHoldingsHistory.asset = holdingAddress.toHex();
        fundHoldingsHistory.amount = holdingAmount;

        // see if there are assets with invalid prices in the portfolio
        let assetGav = BigInt.fromI32(0);
        let validPrice = true;
        let assetPrice =
          assetPriceMap.get(holdingAddress.toHex()) || BigInt.fromI32(0);
        if (!assetPrice.isZero()) {
          let assetDecimals =
            assetDecimalMap.get(holdingAddress.toHex()) || BigInt.fromI32(0);
          assetGav = holdingAmount
            .times(assetPrice as BigInt)
            .div(tenToThePowerOf(assetDecimals as BigInt));
        } else {
          validPrice = false;
          fundGavValid = false;
        }

        fundHoldingsHistory.assetGav = assetGav;
        fundHoldingsHistory.validPrice = validPrice;

        // only save non-zero values
        if (!holdingAmount.isZero()) {
          fundHoldingsHistory.save();
        }
      }

      // have to prevent calling any function which uses calcGav
      // since this fails when any price of an asset is invalid
      if (invalidPrices > 0) {
        continue;
      }

      let calcs = accountingContract.performCalculations();
      let fundGav = calcs.value0;
      let feesInDenomiationAsset = calcs.value1;
      let feesInShares = calcs.value2;
      let nav = calcs.value3;
      let sharePrice = calcs.value4;
      let gavPerShareNetManagementFee = calcs.value5;

      melonNetworkGAV = melonNetworkGAV.plus(fundGav);

      let sharesAddress = Address.fromString(fund.share);
      let sharesContract = SharesContract.bind(sharesAddress);
      let totalSupply = sharesContract.totalSupply();

      // save price calculation to history
      let calculationsId = fundAddress + "/" + timestamp.toString();
      let calculations = new FundCalculationsHistory(calculationsId);
      calculations.fund = fundAddress;
      calculations.timestamp = timestamp;
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
      fund.lastCalculationsUpdate = timestamp;
      fund.save();

      // valuations for individual investments / investors
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
        let investorValuationHistoryId =
          investor.toHex() + "/" + event.block.timestamp.toString();
        let investorValuationLog = investorValuationHistoryEntity(
          investor,
          investorValuationHistoryId
        );
        investorValuationLog.gav = investorValuationLog.gav.plus(investmentGav);
        if (!investorValuationLog.nav) {
          investorValuationLog.nav = BigInt.fromI32(0);
        }
        investorValuationLog.nav = investorValuationLog.nav.plus(investmentNav);
        investorValuationLog.timestamp = event.block.timestamp;
        investorValuationLog.save();
      }
    }
  }

  // save total network GAV
  let networkValue = new MelonNetworkHistory(event.block.timestamp.toString());
  networkValue.timestamp = event.block.timestamp;
  networkValue.gav = melonNetworkGAV;
  networkValue.save();
}
