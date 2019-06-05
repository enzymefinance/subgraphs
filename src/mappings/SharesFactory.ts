import { SharesDataSource } from "../types/SharesFactoryDataSource/templates";
import { NewInstance } from "../types/SharesFactoryDataSource/SharesFactoryContract";
import { Share } from "../types/schema";
import { saveContract } from "./utils/saveContract";

export function handleNewInstance(event: NewInstance): void {
  SharesDataSource.create(event.params.instance);

  let shares = new Share(event.params.instance.toHex());
  shares.fund = event.params.hub.toHex();
  shares.save();

  saveContract(
    shares.id,
    "Shares",
    event.block.timestamp,
    event.block.number,
    shares.fund
  );
}
