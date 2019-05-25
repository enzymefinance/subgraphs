import { VaultDataSource } from "../types/VaultFactoryDataSource/templates";
import { NewInstance } from "../types/VaultFactoryDataSource/VaultFactoryContract";
import { Vault } from "../types/schema";
import { saveContract } from "./utils/saveContract";

export function handleNewInstance(event: NewInstance): void {
  VaultDataSource.create(event.params.instance);

  let vault = new Vault(event.params.instance.toHex());
  vault.fund = event.params.hub.toHex();
  vault.save();

  saveContract(
    vault.id,
    "Vault",
    event.block.timestamp,
    event.block.number,
    event.params.hub.toHex()
  );
}
