import { SharesDataSource } from "../types/SharesFactoryDataSource/templates";
import { NewInstance } from "../types/SharesFactoryDataSource/SharesFactoryContract";
import { Shares } from "../types/schema";

export function handleNewInstance(event: NewInstance): void {
  SharesDataSource.create(event.params.instance);

  let shares = new Shares(event.params.instance.toHex());
  shares.save();
}
