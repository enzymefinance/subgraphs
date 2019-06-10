import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Contract } from "../../types/schema";

export function saveContract(
  id: string,
  name: string,
  creationTime: BigInt,
  creationBlock: BigInt,
  parent: string
): void {
  let parentContract = Contract.load(parent);

  if (!parentContract && name != "Registry") {
    parentContract = new Contract(parent);
    parentContract.name = "Parent";
    parentContract.save();
  }

  let contract = new Contract(id);
  contract.name = name;
  contract.createdAt = creationTime;
  contract.creationBlock = creationBlock;
  contract.parent = parent;
  contract.save();
}
