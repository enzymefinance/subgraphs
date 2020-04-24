import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund, updateFund } from '../entities/Fund';
import { SharesContract, Transfer } from '../generated/v2/VersionContract/SharesContract';

export function handleTransfer(event: Transfer): void {
  let sharesContract = SharesContract.bind(event.address);
  let hubAddress = sharesContract.hub();
  updateFund(ensureFund(hubAddress));
}
