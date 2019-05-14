import { Address } from "@graphprotocol/graph-ts";
import { Asset } from "../../types/schema";
import { ERC20WithFieldsContract } from "../../types/VersionDataSource/ERC20WithFieldsContract";

export function assetEntity(address: Address): Asset {
  let id = address.toHex();
  let asset = Asset.load(id);

  if (!asset) {
    let contract = ERC20WithFieldsContract.bind(address);

    asset = new Asset(id);
    // TODO: HostExportError("Failed to call function \"name\" of contract \"ERC20WithFieldsContract\": ABI error: Cannot decode string"))
    // asset.name = contract.name();
    // asset.symbol = contract.symbol();
    asset.decimals = contract.decimals();
    asset.save();
  }

  return asset as Asset;
}