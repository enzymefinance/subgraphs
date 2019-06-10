import { Trading } from "../types/schema";
import { saveContract } from "./utils/saveContract";
import { NewInstance } from "../types/TradingFactoryDataSourceV101/TradingFactoryContractV101";
import { TradingDataSourceV101 } from "../types/TradingFactoryDataSourceV101/templates";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (event.block.number.toI32() < 7278328) {
    return;
  }

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

  saveContract(
    id,
    "Trading",
    event.block.timestamp,
    event.block.number,
    trading.fund
  );
}
