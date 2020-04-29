import { Address, Entity, BigInt, store, Value } from '@graphprotocol/graph-ts';
import {
  CustomPolicy,
  MaxPositionsPolicy,
  MaxConcentrationPolicy,
  UserWhitelistPolicy,
  AssetWhitelistPolicy,
  AssetBlacklistPolicy,
  PriceTolerancePolicy,
} from '../generated/schema';
import { PolicyContractInterface } from '../generated/PolicyContractInterface';
import { Context } from '../context';

function loadPolicy(policyAddress: Address): Policy | null {
  let candidates: string[] = [
    'CustomPolicy',
    'MaxPositionsPolicy',
    'MaxConcentrationPolicy',
    'UserWhitelistPolicy',
    'AssetWhitelistPolicy',
    'AssetBlacklistPolicy',
    'PriceTolerancePolicy',
  ];

  for (let i: i32 = 0; i < candidates.length; i++) {
    let entity = store.get(candidates[i], policyAddress.toHex());

    if (entity) {
      return entity as Policy;
    }
  }

  return null;
}

export function ensurePolicy(address: Address, context: Context): Policy {
  let loaded = loadPolicy(address);
  if (loaded) {
    return loaded as Policy;
  }

  let fund = context.entities.fund;
  let event = context.event;

  let contract = PolicyContractInterface.bind(address);
  let identifier = contract.try_identifier();

  if (identifier.value == 'UserWhitelist') {
    let policy = new UserWhitelistPolicy(address.toHex());
    policy.identifier = 'USER_WHITELIST';
    policy.fund = fund.id;
    policy.timestamp = event.block.timestamp;
    policy.save();

    // TODO: Add user whitelist listener for white list addresses.
    // TODO: This is the only policy with proper events.

    return policy as Policy;
  }

  if (identifier.value == 'AssetWhitelist') {
    let policy = new AssetWhitelistPolicy(address.toHex());
    policy.identifier = 'ASSET_WHITELIST';
    policy.fund = fund.id;
    policy.timestamp = event.block.timestamp;
    policy.save();

    return policy as Policy;
  }

  if (identifier.value == 'AssetBlacklist') {
    let policy = new AssetBlacklistPolicy(address.toHex());
    policy.identifier = 'ASSET_BLACKLIST';
    policy.fund = fund.id;
    policy.timestamp = event.block.timestamp;
    policy.save();

    return policy as Policy;
  }

  if (identifier.value == 'MaxPositions') {
    let policy = new MaxPositionsPolicy(address.toHex());
    policy.identifier = 'MAX_POSITIONS';
    policy.fund = fund.id;
    policy.timestamp = event.block.timestamp;
    policy.save();

    return policy as Policy;
  }

  if (identifier.value == 'MaxConcentration') {
    let policy = new MaxConcentrationPolicy(address.toHex());
    policy.identifier = 'MAX_CONCENTRATION';
    policy.fund = fund.id;
    policy.timestamp = event.block.timestamp;
    policy.save();

    return policy as Policy;
  }

  if (identifier.value == 'PriceTolerance') {
    let policy = new PriceTolerancePolicy(address.toHex());
    policy.identifier = 'PRICE_TOLERANCE';
    policy.fund = fund.id;
    policy.timestamp = event.block.timestamp;
    policy.save();

    return policy as Policy;
  }

  let policy = new CustomPolicy(address.toHex());
  policy.identifier = 'CUSTOM';
  policy.fund = fund.id;
  policy.timestamp = event.block.timestamp;
  policy.save();

  return policy as Policy;
}

export class Policy extends Entity {
  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get fund(): string {
    let value = this.get('fund');
    return value.toString();
  }

  set fund(value: string) {
    this.set('fund', Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get('timestamp');
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set('timestamp', Value.fromBigInt(value));
  }

  get identifier(): string {
    let value = this.get('identifier');
    return value.toString();
  }

  set identifier(value: string) {
    this.set('identifier', Value.fromString(value));
  }
}
