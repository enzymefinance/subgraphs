import { EventHistoryParameter, EventHistory } from "../codegen/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function saveEventHistory(
  eventId: string,
  eventTimestamp: BigInt,
  fundAddress: string,
  contract: string,
  contractAddress: string,
  eventName: string,
  parameterNames: string[],
  parameterValues: string[]
): void {
  let eventHistoryId =
    eventId + "/" + contractAddress + "/" + eventTimestamp.toString();

  let eventHistory = new EventHistory(eventHistoryId);
  eventHistory.contract = contract;
  eventHistory.contractAddress = contractAddress;
  eventHistory.event = eventName;
  eventHistory.fund = fundAddress;
  eventHistory.timestamp = eventTimestamp;
  eventHistory.save();

  for (let i: i32 = 0; i < parameterNames.length; i++) {
    let eventHistoryParameter = new EventHistoryParameter(
      eventHistoryId + "/" + parameterNames[i]
    );

    eventHistoryParameter.eventHistory = eventHistoryId;
    eventHistoryParameter.name = parameterNames[i];
    eventHistoryParameter.value = parameterValues[i];
    eventHistoryParameter.save();
  }
}
