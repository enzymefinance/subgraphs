import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor } from "../../types/schema";

export function investorEntity(address: string, createdAt: BigInt): Investor {
  let id = address;
  let investor = Investor.load(id);

  if (!investor) {
    investor = new Investor(id);
    investor.createdAt = createdAt;
    investor.save();
  }

  return investor as Investor;
}
