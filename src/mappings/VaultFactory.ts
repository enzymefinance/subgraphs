import { VaultDataSource } from "../types/VaultFactoryDataSource/templates";
import { NewInstance } from "../types/VaultFactoryDataSource/VaultFactoryContract";
import { Vault } from "../types/schema";

export function handleNewInstance(event: NewInstance): void {
  VaultDataSource.create(event.params.instance);

  let vault = new Vault(event.params.instance.toHex());
  vault.save();
}
