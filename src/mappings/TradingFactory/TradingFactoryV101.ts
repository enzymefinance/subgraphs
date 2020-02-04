import { TradingDataSourceV101 } from "../../codegen/templates";
import { Trading } from "../../codegen/schema";
import { saveContract } from "../../utils/saveContract";
import { NewInstance } from "../../codegen/templates/TradingFactoryDataSourceV101/TradingFactoryContractV101";
import { dataSource } from "@graphprotocol/graph-ts";
import { saveEvent } from "../../utils/saveEvent";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7278328
  ) {
    return;
  }

  saveEvent("NewInstance", event);

  TradingDataSourceV101.create(event.params.instance);

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
}
