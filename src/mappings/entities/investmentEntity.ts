import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investment } from "../../types/schema";
import { investorEntity } from "./investorEntity";

export function investmentEntity(owner: Address, fund: Address): Investment {
  let id = owner.toHex() + '/' + fund.toHex();
  let investment = Investment.load(id);

  if (!investment) {
    investment = new Investment(id);
    investment.shares = BigInt.fromI32(0);
    investment.fund = fund.toHex();
    investment.owner = investorEntity(owner).id;
    investment.save();
  }

  return investment as Investment;
}