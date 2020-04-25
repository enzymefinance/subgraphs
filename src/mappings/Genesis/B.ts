import { LogSetOwner } from '../../generated/VersionContract';
import { createVersion, maybeVersion } from '../../entities/Version';
import { Context, context } from '../../context';

export function handleSetOwner(event: LogSetOwner): void {
  if (!maybeVersion(event.address.toHex())) {
    let ctx = Context.fromContext(context, 'B');
    createVersion(event.address, ctx);
  }
}
