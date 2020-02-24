import { AccountingContract__performCalculationsResult } from "../codegen/templates/AccountingDataSource/AccountingContract";
import { BigInt } from "@graphprotocol/graph-ts";

export function emptyCalcsObject(): AccountingContract__performCalculationsResult {
  return new AccountingContract__performCalculationsResult(
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0)
  );
}
