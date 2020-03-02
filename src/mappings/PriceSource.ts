import { dataSource } from "@graphprotocol/graph-ts";
import { Address, BigInt, TypedMap } from "@graphprotocol/graph-ts";
import { PriceUpdate } from "../codegen/templates/PriceSourceDataSource/PriceSourceContract";
import {
  Fund,
  Asset,
  FundHoldingsHistory,
  InvestmentValuationHistory,
  FundCalculationsHistory,
  AssetPriceUpdate,
  AssetPriceHistory,
  MelonNetworkHistory,
  Registry,
  Version,
  PriceSource
} from "../codegen/schema";
import {
  AccountingContract,
  AccountingContract__performCalculationsResult
} from "../codegen/templates/PriceSourceDataSource/AccountingContract";
import { ParticipationContract } from "../codegen/templates/PriceSourceDataSource/ParticipationContract";
import { SharesContract } from "../codegen/templates/PriceSourceDataSource/SharesContract";
import { investmentEntity } from "../entities/investmentEntity";
import { investorValuationHistoryEntity } from "../entities/investorValuationHistoryEntity";
import { currentState } from "../utils/currentState";
import { networkAssetHistoryEntity } from "../entities/networkAssetHistoryEntity";
import { tenToThePowerOf } from "../utils/tenToThePowerOf";
import { performCalculationsManually } from "../utils/performCalculationsManually";
import { saveEvent } from "../utils/saveEvent";
import { emptyCalcsObject } from "../utils/emptyCalcsObject";
import { PriceSourceContract } from "../codegen/templates/ParticipationDataSource/PriceSourceContract";
import { RegistryContract } from "../codegen/templates/PriceSourceDataSource/RegistryContract";

export function handlePriceUpdate(event: PriceUpdate): void {
  // old price updates mess up new funds prices => exclude them
  // if (
  //   event.block.number.ge(BigInt.fromI32(1581897328)) &&
  //   event.params.token.length <= 17
  // ) {
  //   return;
  // }

  saveEvent("PriceUpdate", event);

  let state = currentState();
  let timestamp = event.block.timestamp;
  let prices = event.params.price;
  let tokens = event.params.token;

  // AssetPriceUpdate entity groups all asset prices belonging to one timestamp
  let priceUpdate = new AssetPriceUpdate(event.block.timestamp.toString());
  priceUpdate.timestamp = event.block.timestamp;
  priceUpdate.priceSource = event.address.toHex();
  priceUpdate.numberOfAssets = 0;
  priceUpdate.invalidPrices = 0;
  priceUpdate.numberOfFunds = 0;
  priceUpdate.save();

  // save prices to prevent contract calls for individual funds
  let assetPriceMap = new TypedMap<string, BigInt>();
  let assetDecimalMap = new TypedMap<string, BigInt>();

  let numberOfAssets = 0;
  let invalidPrices = 0;
  let numberOfFunds = 0;

  for (let i: i32 = 0; i < prices.length; i++) {
    let asset = Asset.load(tokens[i].toHex());
    if (!asset) {
      continue;
    }

    // identify invalid prices
    // (they are set to 0 by the contract event emitter)
    let priceValid = true;
    let lastPrice = prices[i];

    if (
      dataSource.network() === "mainnet" &&
      tokens[i].toHex() == "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    ) {
      lastPrice = tenToThePowerOf(BigInt.fromI32(18));
    } else if (lastPrice.isZero()) {
      priceValid = false;
      invalidPrices = invalidPrices + 1;
    }

    asset.lastPrice = lastPrice;
    asset.lastPriceUpdate = event.block.timestamp;
    asset.lastPriceValid = priceValid;
    asset.save();

    // save to asset price history
    let id = asset.id + "/" + event.block.timestamp.toString();
    let assetPriceHistory = new AssetPriceHistory(id);
    assetPriceHistory.priceUpdate = event.block.timestamp.toString();
    assetPriceHistory.asset = asset.id;
    assetPriceHistory.price = lastPrice;
    assetPriceHistory.priceValid = priceValid;
    assetPriceHistory.timestamp = event.block.timestamp;
    assetPriceHistory.save();

    numberOfAssets = numberOfAssets + 1;

    assetPriceMap.set(tokens[i].toHex(), lastPrice);
    assetDecimalMap.set(tokens[i].toHex(), BigInt.fromI32(asset.decimals));
  }

  priceUpdate.numberOfAssets = numberOfAssets;
  priceUpdate.invalidPrices = invalidPrices;
  priceUpdate.save();

  state.lastPriceUpdate = event.block.timestamp;
  state.save();

  let currentRegistry = Registry.load(state.registry) as Registry;
  let currentPriceSource = currentRegistry.priceSource;
  if (!currentPriceSource) {
    return;
  }

  let currentPriceSourceContract = PriceSourceContract.bind(
    Address.fromString(currentPriceSource)
  );

  let melonNetworkGav = BigInt.fromI32(0);
  let melonNetworkValidGav = true;

  // update values for all funds in all deployed versions

  let registries = state.registries;

  for (let r: i32 = 0; r < registries.length; r++) {
    let registryEntity = Registry.load(registries[r]) as Registry;

    let versions = registryEntity.versions;
    for (let v: i32 = 0; v < versions.length; v++) {
      let version = Version.load(versions[v]) as Version;
      let funds = version.funds;
      for (let f: i32 = 0; f < funds.length; f++) {
        let fundAddress = funds[f];
        let fund = Fund.load(fundAddress);

        if (!fund) {
          continue;
        }

        let accountingAddress = Address.fromString(fund.accounting);
        let accountingContract = AccountingContract.bind(accountingAddress);

        // rely on registry's pricesource for valid price
        let registryContract = RegistryContract.bind(
          Address.fromString(fund.registry!)
        );
        // let fundPriceSource = PriceSourceContract.bind(
        //   registryContract.priceSource()
        // );
        let denominationAsset = accountingContract.DENOMINATION_ASSET();

        // fund holdings, incl. finding out if there holdings with invalid prices

        let fundGavValid = true;
        let holdings = accountingContract.getFundHoldings();
        let fundGavFromAssets = BigInt.fromI32(0);

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
          if (currentPriceSourceContract.hasValidPrice(holdingAddress)) {
            if (
              !currentPriceSourceContract.try_convertQuantity(
                holdingAmount,
                holdingAddress,
                denominationAsset
              ).reverted
            ) {
              assetGav = currentPriceSourceContract.try_convertQuantity(
                holdingAmount,
                holdingAddress,
                denominationAsset
              ).value;
            }
          } else {
            validPrice = false;
            fundGavValid = false;
          }

          fundHoldingsHistory.assetGav = assetGav;
          fundHoldingsHistory.validPrice = validPrice;
          fundHoldingsHistory.save();

          fundGavFromAssets = fundGavFromAssets.plus(assetGav);

          // only save non-zero values
          // if (!holdingAmount.isZero()) {
          //   fundHoldingsHistory.save();
          // }

          // add to melonNetworkAssetHistory
          let networkAssetHistory = networkAssetHistoryEntity(
            holdingAddress,
            event.block.timestamp
          );
          networkAssetHistory.amount = networkAssetHistory.amount.plus(
            holdingAmount
          );
          networkAssetHistory.assetGav = networkAssetHistory.assetGav.plus(
            assetGav
          );
          if (!holdingAmount.isZero()) {
            networkAssetHistory.numberOfFunds =
              networkAssetHistory.numberOfFunds + 1;
          }
          if (!validPrice) {
            networkAssetHistory.invalidPrices =
              networkAssetHistory.invalidPrices + 1;
          }
          networkAssetHistory.save();
        }

        // have to prevent calling any function which uses calcGav
        // since this fails when any price of an asset is invalid

        // if (!fundGavValid) {
        //   melonNetworkValidGav = false;
        //   continue;
        // }

        let sharesAddress = Address.fromString(fund.share);
        let sharesContract = SharesContract.bind(sharesAddress);
        let totalSupply = sharesContract.totalSupply();

        let calcs = emptyCalcsObject() as AccountingContract__performCalculationsResult;

        if (fund.priceSource == currentPriceSource) {
          if (accountingContract.try_performCalculations().reverted) {
            calcs = performCalculationsManually(
              fundGavFromAssets,
              totalSupply,
              Address.fromString(fund.feeManager),
              accountingContract
            );
          } else {
            calcs = accountingContract.try_performCalculations().value;
          }
        } else {
          calcs = performCalculationsManually(
            fundGavFromAssets,
            totalSupply,
            Address.fromString(fund.feeManager),
            accountingContract
          );
        }

        let fundGav = calcs.value0;
        let feesInDenomiationAsset = calcs.value1;
        let feesInShares = calcs.value2;
        let nav = calcs.value3;
        let sharePrice = calcs.value4;
        let gavPerShareNetManagementFee = calcs.value5;

        melonNetworkGav = melonNetworkGav.plus(fundGav);

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
        calculations.source = "priceUpdate";
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
        fund.previousDailySharePrice = fund.currentDailySharePrice;
        fund.currentDailySharePrice = sharePrice;
        fund.save();

        numberOfFunds = numberOfFunds + 1;
        priceUpdate.numberOfFunds = numberOfFunds;
        priceUpdate.save();

        // valuations for individual investments / investors
        let participationAddress = Address.fromString(fund.participation);
        let participationContract = ParticipationContract.bind(
          participationAddress
        );
        let historicalInvestors = participationContract.getHistoricalInvestors();
        for (let l: i32 = 0; l < historicalInvestors.length; l++) {
          let investor = historicalInvestors[l].toHex();

          let investment = investmentEntity(
            investor,
            fundAddress,
            event.block.timestamp
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
    }
  }

  // save total network GAV
  let networkValue = new MelonNetworkHistory(event.block.timestamp.toString());
  networkValue.timestamp = event.block.timestamp;
  networkValue.gav = melonNetworkGav;
  networkValue.validGav = melonNetworkValidGav;
  networkValue.save();

  state.networkGav = melonNetworkGav;
  state.save();
}
