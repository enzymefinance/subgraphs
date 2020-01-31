import { TradingDataSourceV1010 } from "../../types/templates";
import { NewInstance } from "../../types/templates/TradingFactoryDataSource/TradingFactoryContract";
import { Trading } from "../../types/schema";
import { saveContract } from "../utils/saveContract";
import { saveEventHistory } from "../utils/saveEventHistory";
import { dataSource } from "@graphprotocol/graph-ts";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7278328
  ) {
    return;
  }

  TradingDataSourceV1010.create(event.params.instance);

  let id = event.params.instance.toHex();

  let trading = new Trading(id);
  trading.fund = event.params.hub.toHex();
  trading.exchanges = event.params.exchanges.map<string>(address =>
    address.toHex()
  );
  trading.adapters = event.params.adapters.map<string>(address =>
    address.toHex()
  );
  trading.save();

  saveContract(id, "Trading", "", event.block.timestamp, trading.fund);

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.params.hub.toHex(),
    "TradingFactory",
    event.address.toHex(),
    "NewInstance",
    [],
    []
  );
}
