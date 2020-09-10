import { Policy } from "../generated/schema";
import { logCritical } from "../utils/logCritical";
import { Address } from "@graphprotocol/graph-ts";




export function usePolicy(id: string): Policy {
  let policy = Policy.load(id);
  if (policy == null) {
    logCritical('Failed to load asset {}.', [id]);
  }

  return policy as Policy;
}

export function ensurePolicy(address: Address, identifier: string): Policy {
  let policy = Policy.load(address.toHex()) as Policy;
  if (policy) {
    return policy;
  }

  policy = new Policy(address.toHex());
  policy.identifier = identifier;
  policy.save();

  return policy;
}
