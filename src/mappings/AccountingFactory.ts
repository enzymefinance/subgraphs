import { NewInstance } from "../types/AccountingFactoryDataSource/AccountingFactoryContract";
import { AccountingDataSource } from "../types/templates";
import { Accounting, EventHistory } from "../types/schema";
import { saveContract } from "./utils/saveContract";
import { saveEventHistoryParameters } from "./utils/saveEventHistoryParameters";
import { saveEventHistory } from "./utils/saveEventHistory";

export function handleNewInstance(event: NewInstance): void {
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
