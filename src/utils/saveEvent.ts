import {
  EthereumEvent,
  EthereumValueKind,
  BigInt,
  EthereumValue
} from "@graphprotocol/graph-ts";
import { Event, EventParameter } from "../codegen/schema";

function stringifyValue(parameter: EthereumValue): string {
  let kind = parameter.kind;

  let out = "";

  if (kind == EthereumValueKind.STRING) {
    out = parameter.toString();
  }

  if (kind == EthereumValueKind.ADDRESS) {
    out = parameter.toAddress().toHex();
  }

  if (kind == EthereumValueKind.INT || kind == EthereumValueKind.UINT) {
    out = parameter.toBigInt().toString();
  }

  if (
    kind == EthereumValueKind.ARRAY ||
    kind == EthereumValueKind.FIXED_ARRAY
  ) {
    let a = parameter.toArray();
    let arrayOut = "";
    for (let i: i32 = 0; i < a.length; i++) {
      if (a[i].kind == EthereumValueKind.ADDRESS) {
        arrayOut = arrayOut.concat(a[i].toAddress().toHex());
      }
      if (a[i].kind == EthereumValueKind.STRING) {
        arrayOut = arrayOut.concat(a[i].toString());
      }
      if (
        a[i].kind == EthereumValueKind.INT ||
        a[i].kind == EthereumValueKind.UINT
      ) {
        arrayOut = arrayOut.concat(a[i].toBigInt().toString());
      }

      if (i < a.length - 1) {
        arrayOut = arrayOut.concat(",");
      }
    }
    out = arrayOut;
  }

  return out;
}

export function saveEvent(name: string, event: EthereumEvent): void {
  let eventId =
    event.transaction.hash.toHex() + "/" + event.logIndex.toString();

  let e = new Event(eventId);
  e.name = name;
  e.block = event.block.number;
  e.hash = event.transaction.hash.toHex();
  e.timestamp = event.block.timestamp;
  e.from = event.transaction.from.toHex();
  e.contract = event.address.toHex();
  e.save();

  for (let i: i32 = 0; i < event.parameters.length; i++) {
    let p = new EventParameter(eventId + "/" + event.parameters[i].name);
    p.event = eventId;
    p.name = event.parameters[i].name;
    p.kind = BigInt.fromI32(event.parameters[i].value.kind);
    p.value = stringifyValue(event.parameters[i].value);
    p.save();
  }
}
