import { VaultDataSource } from "../types/templates";
import { NewInstance } from "../types/VaultFactoryDataSource/VaultFactoryContract";
import { Vault } from "../types/schema";
import { saveContract } from "./utils/saveContract";
import { saveEventHistory } from "./utils/saveEventHistory";

export function handleNewInstance(event: NewInstance): void {
  VaultDataSource.create(event.params.instance);

  let vault = new Vault(event.params.instance.toHex());
  vault.fund = event.params.hub.toHex();
  vault.save();

  saveContract(
    vault.id,
    "Vault",
    "",
    event.block.timestamp,
    event.params.hub.toHex()
  );

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.params.hub.toHex(),
    "VaultFactory",
    event.address.toHex(),
    "NewInstance",
    [],
    []
  );
}
