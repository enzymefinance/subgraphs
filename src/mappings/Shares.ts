import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { context } from '../context';
import { Transfer } from '../generated/SharesContract';
import { zeroAddress } from '../constants';

export function handleTransfer(event: Transfer): void {
  let fund = context.entities.fund;

  if (event.params.to == zeroAddress) {
    fund.shares = fund.shares.minus(event.params.value);
  } else {
    fund.shares = fund.shares.plus(event.params.value);
  }

  fund.save();
}
