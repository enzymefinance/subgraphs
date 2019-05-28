import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestorValuationHistory } from "../../types/schema";
import { investorEntity } from "./investorEntity";

export function investorValuationHistoryEntity(
  owner: Address,
  id: string
): InvestorValuationHistory {
  let investorValuationHistory = InvestorValuationHistory.load(id);

  if (!investorValuationHistory) {
    investorValuationHistory = new InvestorValuationHistory(id);
    investorValuationHistory.gav = BigInt.fromI32(0);
    investorValuationHistory.nav = BigInt.fromI32(0);
    investorValuationHistory.owner = investorEntity(owner).id;
    investorValuationHistory.save();
  }

  return investorValuationHistory as InvestorValuationHistory;
}
