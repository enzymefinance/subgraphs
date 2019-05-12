import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investment } from "../../types/schema";
import { investorEntity } from "./investorEntity";
import { fundEntity } from "./fundEntity";

export function investmentEntity(owner: Address, fund: Address): Investment {
  let id = owner.toHex() + '/' + fund.toHex();
  let investment = Investment.load(id);

  if (investment === null) {
    investment = new Investment(id);
    investment.shares = BigInt.fromI32(0);
    investment.fund = fundEntity(fund).id;
    investment.owner = investorEntity(owner).id;
  }

  return investment as Investment;
}