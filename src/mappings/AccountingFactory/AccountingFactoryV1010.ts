import { NewInstance } from "../../codegen/templates/AccountingFactoryDataSourceV1010/AccountingFactoryContractV1010";
import { AccountingDataSourceV1010 } from "../../codegen/templates";
import { Accounting } from "../../codegen/schema";
import { saveContract } from "../../utils/saveContract";
import { saveEventHistory } from "../../utils/saveEventHistory";
import { dataSource } from "@graphprotocol/graph-ts";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7272194
  ) {
    return;
  }

  AccountingDataSourceV1010.create(event.params.instance);

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

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.params.hub.toHex(),
    "AccountingFactory",
    event.address.toHex(),
    "NewInstance",
    ["denominationAsset", "nativeAsset"],
    [event.params.denominationAsset.toHex(), event.params.nativeAsset.toHex()]
  );
}
