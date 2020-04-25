import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { context } from '../context';
import { Transfer } from '../generated/SharesContract';

export function handleTransfer(event: Transfer): void {
  context.entities.fund.shares = context.contracts.shares.totalSupply();
  context.entities.fund.save();
}
