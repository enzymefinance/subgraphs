import { ethereum } from '@graphprotocol/graph-ts';
import { Fee, Fund } from '../generated/schema';

export function feePayoutId(fund: Fund, fee: Fee, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/fee/' + fee.identifier;
}
