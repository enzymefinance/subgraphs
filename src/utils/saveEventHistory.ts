import { EventHistoryParameter, EventHistory } from "../codegen/schema";
import { BigInt, Address } from "@graphprotocol/graph-ts";

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

export class EventHistoryParams {
  private _params: EventHistoryParams;

  constructor(parameters: EventHistoryParams) {
    this._params = parameters;
  }

  set id(value: String) {
    this._params.id = value;
  }

  get id(): String {
    return this._params.id;
  }

  set timestamp(value: BigInt) {
    this._params.timestamp = value;
  }

  get timestamp(): BigInt {
    return this._params.timestamp;
  }

  set fund(value: Address) {
    this._params.fund = value;
  }

  get fund(): Address {
    return this._params.fund;
  }
}
