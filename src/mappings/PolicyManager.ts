import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { ensurePolicy } from '../entities/Policy';
import { Registration } from '../generated/PolicyManagerContract';

export function handleRegistration(event: Registration): void {
  ensurePolicy(event, event.params.policy, context.entities.fund);
  createFundEvent('Registration', event, context);
}
