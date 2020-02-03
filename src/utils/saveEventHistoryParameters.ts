import { EventHistoryParameter } from "../codegen/schema";

export function saveEventHistoryParameters(
  eventHistoryId: string,
  names: string[],
  values: string[]
): void {
  for (let i: i32 = 0; i < names.length; i++) {
    let eventHistoryParameter = new EventHistoryParameter(
      eventHistoryId + "/" + names[i]
    );

    eventHistoryParameter.eventHistory = eventHistoryId;
    eventHistoryParameter.name = names[i];
    eventHistoryParameter.value = values[i];
    eventHistoryParameter.save();
  }
}
