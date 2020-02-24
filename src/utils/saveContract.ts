import { BigInt } from "@graphprotocol/graph-ts";
import { Contract } from "../codegen/schema";

export function saveContract(
  id: string,
  name: string,
  description: string,
  creationTime: BigInt,
  parent: string
): void {
  let parentContract = Contract.load(parent);

  //
  if (!parentContract && name != "Registry") {
    parentContract = new Contract(parent);
    parentContract.name = "Hub (incomplete)";
    parentContract.createdAt = creationTime;
    parentContract.save();
  }

  let contract = Contract.load(id);
  if (!contract) {
    contract = new Contract(id);
    contract.name = name;
    contract.description = description;
    contract.createdAt = creationTime;
    contract.parent = parent;
    contract.save();
  } else if (contract.name == "Hub (incomplete)") {
    contract.name = name;
    contract.description = description;
    contract.parent = parent;
    contract.save();
  }
}
