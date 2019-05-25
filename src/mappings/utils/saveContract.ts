import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Contract } from "../../types/schema";

export function saveContract(
  id: string,
  name: string,
  creationTime: BigInt,
  creationBlock: BigInt,
  parent: string
): void {
  // return if parent contract doesn't exist (unless parent is empty -> root contract)
  // if (parent != "") {
  //   let parentContract = Contract.load(parent);
  //   if (!parentContract) {
  //     return;
  //   }
  // }

  let contract = Contract.load(id);
  if (!contract) {
    contract = new Contract(id);
  }

  contract.name = name;
  contract.creationTime = creationTime;
  contract.creationBlock = creationBlock;
  contract.parent = parent;
  contract.save();
}
