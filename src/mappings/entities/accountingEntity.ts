import { Address } from "@graphprotocol/graph-ts";
import { Accounting } from "../../types/schema";
import { AccountingDataSource } from "../../types/VersionDataSource/templates";
import { AccountingContract } from "../../types/VersionDataSource/templates/AccountingDataSource/AccountingContract";
import { assetEntity } from "./assetEntity";

export function accountingEntity(address: Address): Accounting {
  let id = address.toHex()
  let accounting = Accounting.load(id);

  if (accounting === null) {
    AccountingDataSource.create(address);

    let contract = AccountingContract.bind(address);
    accounting = new Accounting(id);
    accounting.demoniationAsset = assetEntity(contract.DENOMINATION_ASSET()).id;
    accounting.nativeAsset = assetEntity(contract.NATIVE_ASSET()).id;
    accounting.save();
  }

  return accounting as Accounting;
}
