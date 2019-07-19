import { NewInstance } from "../types/AccountingFactoryDataSource/AccountingFactoryContract";
import { AccountingDataSource } from "../types/AccountingFactoryDataSource/templates";
import { Accounting, EventHistory } from "../types/schema";
import { saveContract } from "./utils/saveContract";
import { saveEventHistoryParameters } from "./utils/saveEventHistoryParameters";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (event.block.number.toI32() < 7272194) {
    return;
  }

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
    event.block.timestamp,
    event.block.number,
    event.params.hub.toHex()
  );

  let eventHistoryId = event.transaction.hash.toHex();
  let eventHistory = new EventHistory(eventHistoryId);
  eventHistory.contract = "AccountingFactory";
  eventHistory.contractAddress = event.address.toHex();
  eventHistory.event = "NewInstance";
  eventHistory.fund = event.params.hub.toHex();
  eventHistory.timestamp = event.block.timestamp;
  eventHistory.save();

  saveEventHistoryParameters(
    eventHistoryId,
    ["denominationAsset", "nativeAsset"],
    [event.params.denominationAsset.toHex(), event.params.nativeAsset.toHex()]
  );
}
