import { dataSource } from '@graphprotocol/graph-ts';
import { Context } from '../context';
import { createContractEvent } from '../entities/Event';
import { ensurePolicy } from '../entities/Policy';
import { Registration } from '../generated/PolicyManagerContract';

export function handleRegistration(event: Registration): void {
  let context = new Context(dataSource.context(), event);
  ensurePolicy(event.params.policy, context);
  createContractEvent('Registration', context);
}
