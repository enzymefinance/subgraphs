import { Entity, store, Value } from '@graphprotocol/graph-ts';

export class PolicySetting extends Entity {
  constructor(id: string) {
    super();
    this.set('id', Value.fromString(id));
  }

  save(identifier: string): void {
    store.set(getPolicySettingEntity(identifier), this.get('id').toString(), this);
  }

  static load(identifier: string, id: string): PolicySetting | null {
    return store.get(getPolicySettingEntity(identifier), id) as PolicySetting | null;
  }

  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get enabled(): boolean {
    let value = this.get('enabled');
    return value.toBoolean();
  }

  set enabled(value: boolean) {
    this.set('enabled', Value.fromBoolean(value));
  }
}

export function getPolicySettingEntity(identifier: string): string {
  if (identifier == 'ADAPTER_BLACKLIST') {
    return 'AdapterBlacklistSetting';
  }

  if (identifier == 'ADAPTER_WHITELIST') {
    return 'AdapterWhitelistSetting';
  }

  if (identifier == 'ASSET_BLACKLIST') {
    return 'AssetBlacklistSetting';
  }

  if (identifier == 'ASSET_WHITELIST') {
    return 'AssetWhitelistSetting';
  }

  if (identifier == 'BUY_SHARES_CALLER_WHITELIST') {
    return 'BuySharesCallerWhitelistSetting';
  }

  if (identifier == 'GUARANTEED_REDEMPTION') {
    return 'GuaranteedRedemptionSetting';
  }

  if (identifier == 'INVESTOR_WHITELIST') {
    return 'InvestorWhitelistSetting';
  }

  if (identifier == 'MAX_CONCENTRATION') {
    return 'MaxConcentrationSetting';
  }

  if (identifier == 'MIN_MAX_INVESTMENT') {
    return 'MinMaxInvestmentSetting';
  }

  return 'UnknownPolicySetting';
}
