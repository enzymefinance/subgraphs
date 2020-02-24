import { NewInstance } from "../../codegen/templates/AccountingFactoryDataSource/AccountingFactoryContract";
import { AccountingDataSource } from "../../codegen/templates";
import { Accounting } from "../../codegen/schema";
import { saveContract } from "../../utils/saveContract";
import { dataSource } from "@graphprotocol/graph-ts";
import { saveEvent } from "../../utils/saveEvent";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7272194
  ) {
    return;
  }

  saveEvent("NewInstance", event);

  AccountingDataSource.create(event.params.instance);

  let accounting = new Accounting(event.params.instance.toHex());
  accounting.fund = event.params.hub.toHex();
  accounting.denominationAsset = event.params.denominationAsset.toHex();
  accounting.nativeAsset = event.params.nativeAsset.toHex();
  accounting.ownedAssets = [];
  accounting.save();

  saveContract(
    accounting.id,
    "Accounting",
    "",
    event.block.timestamp,
    event.params.hub.toHex()
  );
}
