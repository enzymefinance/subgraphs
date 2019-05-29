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
  let parentContract = Contract.load(parent);

  if (!parentContract || name == "Registry") {
    // log.warning("No parent contract. {} {} {}", [id, name, parent]);
    return;
  }

  let contract = Contract.load(id);
  if (!contract) {
    contract = new Contract(id);
  }

  contract.name = name;
  contract.creationTime = creationTime;
  contract.creationBlock = creationBlock;
  contract.parent = parentContract.id;
  contract.save();
}
