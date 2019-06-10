import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investment } from "../../types/schema";
import { investorEntity } from "./investorEntity";

export function investmentEntity(
  owner: Address,
  fund: Address,
  createdAt: BigInt
): Investment {
  let id = owner.toHex() + "/" + fund.toHex();
  let investment = Investment.load(id);

  if (!investment) {
    investment = new Investment(id);
    investment.createdAt = createdAt;
    investment.shares = BigInt.fromI32(0);
    investment.gav = BigInt.fromI32(0);
    investment.nav = BigInt.fromI32(0);
    investment.fund = fund.toHex();
    investment.owner = investorEntity(owner, createdAt).id;
    investment.save();
  }

  return investment as Investment;
}
