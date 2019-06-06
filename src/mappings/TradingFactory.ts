import { TradingDataSource } from "../types/TradingFactoryDataSource/templates";
import { NewInstance } from "../types/TradingFactoryDataSource/TradingFactoryContract";
import { Trading } from "../types/schema";
import { saveContract } from "./utils/saveContract";

export function handleNewInstance(event: NewInstance): void {
  TradingDataSource.create(event.params.instance);

  let id = event.params.instance.toHex();

  let trading = new Trading(id);
  trading.fund = event.params.hub.toHex();
  trading.save();

  saveContract(
    trading.id,
    "Trading",
    event.block.timestamp,
    event.block.number,
    trading.fund
  );
}
