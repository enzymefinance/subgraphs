import { EthereumEvent } from "@graphprotocol/graph-ts";
import { Event, EventParameter } from "../codegen/schema";

export function saveEvent(name: string, event: EthereumEvent): void {
  let eventId =
    event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  let e = new Event(eventId);
  e.name = name;
  e.block = event.block.number;
  e.timestamp = event.block.timestamp;
  e.save();

  for (let i: i32 = 0; i < event.parameters.length; i++) {
    let p = new EventParameter(eventId + "/" + event.parameters[i]);
    p.event = eventId;
    p.name = event.parameters[i].name;
    p.value = event.parameters[i].value.toString();
    p.save();
  }
}
