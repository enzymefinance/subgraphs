import { RequestExecution, Participation, Redemption } from "../types/Version/templates/Participation/Participation";
import { Investor, Investment } from "../types/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleRequestExecution(event: RequestExecution): void {
  let owner = event.params.requestOwner.toHexString();
  let investor = Investor.load(owner);
  if (!investor) {
    investor = new Investor(owner);
  }
  investor.save();

  let contract = Participation.bind(event.address);
  let fund = contract.hub().toHexString();
  let investment = Investment.load(owner + '/' + fund);
  if (!investment) {
    investment = new Investment(owner + '/' + fund);
    investment.shares = BigInt.fromI32(0);
    investment.owner = owner;
    investment.fund = fund;
  }

  investment.shares = investment.shares.plus(event.params.requestedShares);
  investment.save();
}

export function handleRedemption(event: Redemption): void {
  let owner = event.params.redeemer.toHexString();
  let contract = Participation.bind(event.address);
  let fund = contract.hub().toHexString();
  let investment = Investment.load(owner + '/' + fund);
  if (!investment) {
    return;
  }

  investment.shares = investment.shares.minus(event.params.redeemedShares);
  investment.save();
}