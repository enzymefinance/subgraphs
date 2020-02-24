import {
  Approval,
  Transfer
} from "../codegen/templates/SharesDataSource/SharesContract";
import { saveEvent } from "../utils/saveEvent";

export function handleApproval(event: Approval): void {
  saveEvent("Approval", event);
}

export function handleTransfer(event: Transfer): void {
  saveEvent("Transfer", event);
}
