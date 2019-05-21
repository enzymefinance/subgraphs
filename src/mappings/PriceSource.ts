import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  PriceUpdate, PriceSourceContract,
} from "../types/PriceSourceDataSource/PriceSourceContract";
import {
  Fund,
  Asset,
  AssetPriceUpdate,
  FundCalculationsUpdate
} from "../types/schema";
import { AccountingContract } from "../types/PriceSourceDataSource/AccountingContract";
import { VersionContract } from "../types/PriceSourceDataSource/VersionContract";
import { currentState } from "./utils/currentState";
import { versionAddress } from "../statics";
import { RegistryContract } from "../types/PriceSourceDataSource/RegistryContract";

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

    asset.lastPriceUpdate = event.block.timestamp;
    asset.save();
  }
}

function updateFundCalculations(event: PriceUpdate): void {
  let priceSourceContract = PriceSourceContract.bind(event.address);
  let registryAddress = priceSourceContract.REGISTRY();
  let registryContract = RegistryContract.bind(registryAddress);
  let versions = registryContract.getRegisteredVersions();

  for (let i: i32 = 0; i < versions.length; i++) {
    // Only run on the current version.
    if (versions[i].toHex() != versionAddress.toHex()) {
      continue;
    }

    // Only update at most once an hour.
    let state = currentState();
    let interval = BigInt.fromI32(3600);
    if (event.block.timestamp.minus(state.lastCalculation).gt(interval)) {
      state.lastCalculation = event.block.timestamp;

      let versionContract = VersionContract.bind(versions[i]);
      let lastFundId = versionContract.getLastFundId();

      // Bail out if no fund has been registered yet.
      if (lastFundId.lt(BigInt.fromI32(0))) {
        return;
      }

      // TODO: What the actual fuck?
      if (lastFundId.gt(BigInt.fromI32(99999999))) {
        return;
      }

      for (let j: i32 = 0; j < lastFundId.toI32(); j++) {
        // TODO: Seriously, what the fuck?!
        if (j === 4) {
          continue;
        }

        let fundAddress = versionContract.getFundById(BigInt.fromI32(j)).toHex();
        let fund = Fund.load(fundAddress);
        if (!fund) {
          continue;
        }

        if (fund.isShutdown) {
          continue;
        }

        let accountingAddress = Address.fromString(fund.accounting);
        let accountingContract = AccountingContract.bind(accountingAddress);
        let values = accountingContract.performCalculations();

        let timestamp = event.block.timestamp;
        let calculationsId = fundAddress + "/" + timestamp.toString();
        let calculations = new FundCalculationsUpdate(calculationsId);
        calculations.fund = fundAddress;
        calculations.timestamp = timestamp;
        calculations.gav = values.value0;
        calculations.feesInDenominationAsset = values.value1;
        calculations.feesInShares = values.value2;
        calculations.nav = values.value3;
        calculations.sharePrice = values.value4;
        calculations.gavPerShareNetManagementFee = values.value5;
        calculations.save();

        fund.gav = values.value0;
        fund.feesInDenominationAsset = values.value1;
        fund.feesInShares = values.value2;
        fund.nav = values.value3;
        fund.sharePrice = values.value4;
        fund.gavPerShareNetManagementFee = values.value5;
        fund.lastCalculationsUpdate = timestamp;
        fund.save();
      }
    
      state.save();
    }
  }
}

export function handlePriceUpdate(event: PriceUpdate): void {
  updateAssetPrices(event);
  updateFundCalculations(event);
} 
