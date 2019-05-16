import {
  SetAmguPrice,
  RegistryChange,
  AmguPaid
} from "../types/EngineDataSource/EngineContract";
import { Engine, AmguPrice, Amgu } from "../types/schema";

import { Address } from "@graphprotocol/graph-ts";

export function handleSetAmguPrice(event: SetAmguPrice): void {
  let amguPrice = new AmguPrice(event.transaction.hash.toHex());
  amguPrice.price = event.params.amguPrice;
  amguPrice.engine = event.address.toHex();
  amguPrice.timestamp = event.block.timestamp;
  amguPrice.save();

  let engine = Engine.load(event.address.toHex());
  engine!.amguPrices = engine!.amguPrices.concat([amguPrice.id]);
  engine!.save();
}

export function handleAmguPaid(event: AmguPaid): void {
  let amgu = new Amgu(event.transaction.hash.toHex());
  amgu.amount = event.params.amount;
  amgu.timestamp = event.block.timestamp;
  amgu.save();

  let engine = Engine.load(event.address.toHex());
  engine!.amguPaid = engine!.amguPaid.concat([amgu.id]);
  engine!.save();
}

export function handleRegistryChange(event: RegistryChange): void {}
