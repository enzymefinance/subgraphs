import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { createFund } from '../entities/Fund';
import { ensureManager } from '../entities/Account';
import { NewFund } from '../generated/VersionContract';

export function handleNewFund(event: NewFund): void {
  let ctx = Context.fromContext(context);
  ctx.hub = event.params.hub.toHex();

  let routes = event.params.routes as Address[];
  ctx.accounting = routes[0].toHex();
  ctx.fees = routes[1].toHex();
  ctx.participation = routes[2].toHex();
  ctx.policies = routes[3].toHex();
  ctx.shares = routes[4].toHex();
  ctx.trading = routes[5].toHex();

  let manager = ensureManager(event.params.manager);
  ctx.entities.manager = manager;

  createFund(event, event.params.hub, ctx);
  createFundEvent('NewFund', event, ctx);
}
