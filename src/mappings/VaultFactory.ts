import { VaultDataSource } from "../codegen/templates";
import { NewInstance } from "../codegen/templates/VaultFactoryDataSource/VaultFactoryContract";
import { Vault } from "../codegen/schema";
import { saveContract } from "../utils/saveContract";
import { saveEventHistory } from "../utils/saveEventHistory";
import { dataSource } from "@graphprotocol/graph-ts";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7278338
  ) {
    return;
  }

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
