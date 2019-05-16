import { Registration } from "../types/PolicyManagerFactoryDataSource/templates/PolicyManagerDataSource/PolicyManagerContract";
import { Policy } from "../types/schema";

export function handleRegistration(event: Registration): void {
  // TODO (understand policymanager, policy and individual policies)
  let policy = new Policy(event.transaction.hash.toHex());
  policy.position = event.params.position;
  policy.policy = event.params.policy.toHex();
  policy.save();
}
