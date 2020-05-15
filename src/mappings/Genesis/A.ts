import { dataSource } from '@graphprotocol/graph-ts';
import { LogSetOwner } from '../../generated/VersionContract';
import { createVersion, maybeVersion } from '../../entities/Version';
import { Context } from '../../context';

export function handleSetOwner(event: LogSetOwner): void {
  if (!maybeVersion(event.address.toHex())) {
    let context = new Context(dataSource.context(), event);
    let ctx = Context.forBranch(context, event, 'A');
    createVersion(event.address, '0.9.44', ctx);
  }
}
