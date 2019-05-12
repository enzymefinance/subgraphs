import { Address } from "@graphprotocol/graph-ts";
import { Investor } from "../../types/schema";

export function investorEntity(address: Address): Investor {
  let id = address.toHex();
  let investor = Investor.load(id);

  if (investor === null) {
    investor = new Investor(id);
    investor.save();
  }

  return investor as Investor;
}