import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestorValuationLog } from "../../types/schema";
import { investorEntity } from "./investorEntity";

export function investorValuationLogEntity(
  owner: Address,
  id: string
): InvestorValuationLog {
  let investorValuationLog = InvestorValuationLog.load(id);

  if (!investorValuationLog) {
    investorValuationLog = new InvestorValuationLog(id);
    investorValuationLog.gav = BigInt.fromI32(0);
    investorValuationLog.owner = investorEntity(owner).id;
    investorValuationLog.save();
  }

  return investorValuationLog as InvestorValuationLog;
}
