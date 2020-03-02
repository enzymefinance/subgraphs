import { Address, dataSource } from "@graphprotocol/graph-ts";

export function exchangeNameFromAddress(address: Address): string {
  // match names for mainnet and kovan contracts
  let name = "";

  if (dataSource.network() == "mainnet") {
    if (address.toHex() == "0x39755357759ce0d7f32dc8dc45414cca409ae24e") {
      name = "Oasisdex";
    } else if (
      address.toHex() == "0x794e6e91555438afc3ccf1c5076a74f42133d08d"
    ) {
      name = "Oasisdex";
    } else if (
      address.toHex() == "0x818e6fecd516ecc3849daf6845e3ec868087b755"
    ) {
      name = "Kyber Network";
    } else if (
      address.toHex() == "0x4f833a24e1f95d70f028921e27040ca56e09ab0b"
    ) {
      name = "0x (v2.0)";
    } else if (
      address.toHex() == "0x080bf510fcbf18b91105470639e9561022937712"
    ) {
      name = "0x (v2.1)";
    } else if (
      address.toHex() == "0xdcdb42c9a256690bd153a7b409751adfc8dd5851"
    ) {
      name = "Ethfinex";
    } else if (
      address.toHex() == "0x7caec96607c5c7190d63b5a650e7ce34472352f5"
    ) {
      name = "Melon Engine (v2)";
    } else if (
      address.toHex() == "0x342814604cd5cc4bdeed100edebd51cac3fd98c9"
    ) {
      name = "Melon Engine (v1)";
    } else if (
      address.toHex() == "0xc0a47dfe034b400b47bdad5fecda2621de6c4d95"
    ) {
      name = "Uniswap";
    } else if (
      address.toHex() == "0x61935cbdd02287b511119ddb11aeb42f1593b7ef"
    ) {
      name = "0x (v3)";
    } else if (
      address.toHex() == "0xd0cb33018ee403dbd1d5cd021c289f27811abb32"
    ) {
      name = "Melon Engine (v3)";
    }
  }

  return name;
}
