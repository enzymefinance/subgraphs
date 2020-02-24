import { Address, dataSource } from "@graphprotocol/graph-ts";

export function assetNameFromAddress(address: Address): string {
  let name = "";

  // TODO: Fall back to using the asset name from the contract (call `.name()`);
  if (dataSource.network() == "mainnet") {
    if (address.toHex() == "0x0d8775f648430679a709e98d2b0cb6250d2887ef") {
      name = "Basic Attention Token";
    } else if (
      address.toHex() == "0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf"
    ) {
      name = "Digix Gold Token";
    } else if (
      address.toHex() == "0x1985365e9f78359a9b6ad760e32412f4a445e862"
    ) {
      name = "Augur Reputation Token";
    } else if (
      address.toHex() == "0xe41d2489571d322189246dafa5ebde1f4699f498"
    ) {
      name = "0x Protocol Token";
    } else if (
      address.toHex() == "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    ) {
      name = "Wrapped Ether";
    } else if (
      address.toHex() == "0xec67005c4e498ec7f55e092bd1d35cbc47c91892"
    ) {
      name = "Melon Token";
    } else if (
      address.toHex() == "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"
    ) {
      name = "Maker Token";
    } else if (
      address.toHex() == "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"
    ) {
      name = "Sai Stable Coin";
    } else if (
      address.toHex() == "0xdd974d5c2e2928dea5f71b9825b8b646686bd200"
    ) {
      name = "Kyber Network";
    } else if (
      address.toHex() == "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    ) {
      name = "USD Coin";
    } else if (
      address.toHex() == "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
    ) {
      name = "Wrapped BTC";
    } else if (
      address.toHex() == "0x0f5d2fb29fb7d3cfee444a200298f468908cc942"
    ) {
      name = "Decentraland";
    } else if (
      address.toHex() == "0x408e41876cccdc0f92210600ef50372656052a38"
    ) {
      name = "Republic Project";
    } else if (
      address.toHex() == "0x514910771af9ca656af840dff83e8264ecf986ca"
    ) {
      name = "ChainLink";
    } else if (
      address.toHex() == "0x5dbac24e98e2a4f43adc0dc82af403fca063ce2c"
    ) {
    } else if (
      address.toHex() == "0xf0ee6b27b759c9893ce4f094b49ad28fd15a23e4"
    ) {
      name = "Enigma Token";
    } else if (
      address.toHex() == "0x607f4c5bb672230e8672085532f7e901544a7375"
    ) {
      name = "iExec Token";
    } else if (
      address.toHex() == "0x6b175474e89094c44da98b954eedeac495271d0f"
    ) {
      name = "Multi-Collateral Dai";
    } else if (
      address.toHex() == "0x960b236a07cf122663c4303350609a66a7b288c0"
    ) {
      name = "Aragon Network Token";
    } else if (
      address.toHex() == "0xd26114cd6ee289accf82350c8d8487fedb8a0c07"
    ) {
      name = "OmiseGo";
    } else if (
      address.toHex() == "0xdac17f958d2ee523a2206206994597c13d831ec7"
    ) {
      name = "Tether USD";
    } else if (
      address.toHex() == "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c"
    ) {
      name = "Enjin Coin";
    }
  }

  return name;
}
