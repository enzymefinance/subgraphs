import { TradingDataSource } from "../types/TradingFactoryDataSource/templates";
import { NewInstance } from "../types/TradingFactoryDataSource/TradingFactoryContract";
import { Trading } from "../types/schema";

export function handleNewInstance(event: NewInstance): void {
  TradingDataSource.create(event.params.instance);

  let trading = new Trading(event.params.instance.toHex());
  trading.save();
}
