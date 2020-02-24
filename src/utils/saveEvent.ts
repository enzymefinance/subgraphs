import {
  EthereumEvent,
  BigInt,
  EthereumValue,
  EthereumValueKind as KindEnum
} from "@graphprotocol/graph-ts";
import { Event, EventParameter } from "../codegen/schema";

function stringifyValue(parameter: EthereumValue): string {
  let kind = parameter.kind;

  let out = "";

  if (kind == KindEnum.STRING) {
    out = parameter.toString();
  }

  if (kind == KindEnum.ADDRESS) {
    out = parameter.toAddress().toHex();
  }

  if (kind == KindEnum.INT || kind == KindEnum.UINT) {
    out = parameter.toBigInt().toString();
  }

  if (kind == KindEnum.FIXED_BYTES || kind == KindEnum.BYTES) {
    out = parameter.toBytes().toHexString();
  }

  if (kind == KindEnum.BOOL) {
    out = parameter.toBoolean() ? "1" : "0";
  }

  if (kind == KindEnum.ARRAY || kind == KindEnum.FIXED_ARRAY) {
    let a = parameter.toArray();
    let arrayOut = "";
    for (let i: i32 = 0; i < a.length; i++) {
      arrayOut = arrayOut.concat(stringifyValue(a[i]));

      if (i < a.length - 1) {
        arrayOut = arrayOut.concat(",");
      }
    }
    out = arrayOut;
  }

  return out;
}

function isArrayParameter(param: EthereumValue): boolean {
  return param.kind == KindEnum.ARRAY || param.kind == KindEnum.FIXED_ARRAY;
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
    p.isArray = isArrayParameter(event.parameters[i].value);
    p.save();
  }
}
