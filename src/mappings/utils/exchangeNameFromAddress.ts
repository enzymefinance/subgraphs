import { Address, dataSource } from "@graphprotocol/graph-ts";

export function exchangeNameFromAddress(address: Address): string {
  // match names for mainnet and kovan contracts
  let name = "";

  if (dataSource.network() == "mainnet") {
    switch (address.toHex()) {
      case "0x39755357759ce0d7f32dc8dc45414cca409ae24e":
        name = "Oasisdex";
      case "0x818e6fecd516ecc3849daf6845e3ec868087b755":
        name = "Kyber Network";
      case "0x4f833a24e1f95d70f028921e27040ca56e09ab0b":
        name = "0x (v2.0)";
      case "0x080bf510fcbf18b91105470639e9561022937712":
        name = "0x (v2.1)";
      case "0xdcdb42c9a256690bd153a7b409751adfc8dd5851":
        name = "Ethfinex";
      case "0x7caec96607c5c7190d63b5a650e7ce34472352f5":
        name = "Melon Engine (v2)";
      case "0xcbb801141a1704dbe5b4a6224033cfae80c4b336":
        name = "Melon Engine (v1)";
      case "0xc0a47dfe034b400b47bdad5fecda2621de6c4d95":
        name = "Uniswap";
      case "0x61935cbdd02287b511119ddb11aeb42f1593b7ef":
        name = "0x (v3)";
      case "0xd0cb33018ee403dbd1d5cd021c289f27811abb32":
        name = "Melon Engine (v3)";
    }
  }

  return name;
}
