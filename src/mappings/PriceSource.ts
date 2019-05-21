import { Address, log, BigInt } from "@graphprotocol/graph-ts";
import {
  PriceUpdate,
  PriceSourceContract
} from "../types/PriceSourceDataSource/PriceSourceContract";
import {
  AssetPrice,
  AssetPriceUpdate,
  Asset,
  Version,
  Fund,
  FundCalculations
} from "../types/schema";
import { AccountingContract } from "../types/PriceSourceDataSource/AccountingContract";
import { RegistryContract } from "../types/PriceSourceDataSource/RegistryContract";
import { VersionContract } from "../types/PriceSourceDataSource/VersionContract";
import { isBlacklisted } from "./utils/ignoreVersions";

export function handlePriceUpdate(event: PriceUpdate): void {
  let assetPriceUpdate = new AssetPriceUpdate(event.transaction.hash.toHex());
  assetPriceUpdate.timestamp = event.block.timestamp;
  assetPriceUpdate.save();

  let prices = event.params.price;
  let tokens = event.params.token;

  for (let i: i32 = 0; i < prices.length; i++) {
    let price = new AssetPrice(
      event.transaction.hash.toHex() + "/" + tokens[i].toHex()
    );
    price.price = prices[i];
    let asset = new Asset(tokens[i].toHex());
    price.asset = asset.id;
    price.timestamp = event.block.timestamp;
    price.assetPriceUpdate = event.transaction.hash.toHex();
    price.save();
  }

  let priceSourceContract = PriceSourceContract.bind(event.address);
  let registryAddress = priceSourceContract.REGISTRY();
  let registryContract = RegistryContract.bind(registryAddress);
  let versionAddresses = registryContract.getRegisteredVersions();

  for (let i: i32 = 0; i < versionAddresses.length; i++) {
    // Bail out if this is a blacklisted version.
    if (isBlacklisted(versionAddresses[i].toHexString())) {
      continue;
    }

    let versionContract = VersionContract.bind(versionAddresses[i]);
    let lastFundId = versionContract.getLastFundId();

    // Bail out if no fund has been registered yet.
    if (lastFundId.lt(BigInt.fromI32(0))) {
      continue;
    }

    // TODO: What the actual fuck?
    if (lastFundId.gt(BigInt.fromI32(99999999))) {
      continue;
    }

    log.warning("Version is: {}", [versionAddresses[i].toHexString()]);

    for (
      let j: BigInt = BigInt.fromI32(0);
      j.le(lastFundId);
      j = j.plus(BigInt.fromI32(1))
    ) {
      log.warning("Loading fund number {}", [j.toString()]);
      let fundAddress = versionContract.getFundById(j).toHex();
      let fund = Fund.load(fundAddress);

      if (!fund || fund.isShutdown) {
        continue;
      }

      let accountingAddress = Address.fromString(fund.accounting);
      let accountingContract = AccountingContract.bind(
        accountingAddress as Address
      );

      let values = accountingContract.performCalculations();
      let timestamp = event.block.timestamp;
      let calculationsId = fundAddress + "/" + timestamp.toString();
      let calculations = new FundCalculations(calculationsId);
      calculations.fund = fundAddress;
      calculations.timestamp = timestamp;
      calculations.gav = values.value0;
      calculations.feesInDenominationAsset = values.value1;
      calculations.feesInShares = values.value2;
      calculations.nav = values.value3;
      calculations.sharePrice = values.value4;
      calculations.gavPerShareNetManagementFee = values.value5;
      calculations.save();

      fund.calculations = calculationsId;
      fund.save();
    }
  }
}
