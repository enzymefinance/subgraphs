import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investment } from "../../types/schema";
import { investorEntity } from "./investorEntity";

export function investmentEntity(
  owner: string,
  fund: string,
  createdAt: BigInt
): Investment {
  let id = owner + "/" + fund;
  let investment = Investment.load(id);

  if (!investment) {
    investment = new Investment(id);
    investment.createdAt = createdAt;
    investment.shares = BigInt.fromI32(0);
    investment.gav = BigInt.fromI32(0);
    investment.nav = BigInt.fromI32(0);
    investment.fund = fund;
    investment.owner = investorEntity(owner, createdAt).id;
    investment.save();
  }

  return investment as Investment;
}
