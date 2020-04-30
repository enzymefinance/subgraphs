import { DataSourceContext, Address, Entity, log, ethereum } from '@graphprotocol/graph-ts';
import { Fund, Version, Account, State } from './generated/schema';
import { HubContract } from './generated/HubContract';
import { AccountingContract } from './generated/AccountingContract';
import { ParticipationContract } from './generated/ParticipationContract';
import { SharesContract } from './generated/SharesContract';
import { TradingContract } from './generated/TradingContract';
import { PolicyManagerContract } from './generated/PolicyManagerContract';
import { FeeManagerContract } from './generated/FeeManagerContract';
import { VersionContract } from './generated/VersionContract';
import { RegistryContract } from './generated/RegistryContract';
import { ensureState } from './entities/Tracking';
import { useFund } from './entities/Fund';
import { useVersion } from './entities/Version';
import { useAccount } from './entities/Account';
import { AbstractionLayer } from './api';

export class ContextContracts {
  context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  get registry(): RegistryContract {
    let address = Address.fromString(this.context.registry);
    return RegistryContract.bind(address);
  }

  get version(): VersionContract {
    let address = Address.fromString(this.context.version);
    return VersionContract.bind(address);
  }

  get hub(): HubContract {
    let address = Address.fromString(this.context.hub);
    return HubContract.bind(address);
  }

  get accounting(): AccountingContract {
    let address = Address.fromString(this.context.accounting);
    return AccountingContract.bind(address);
  }

  get participation(): ParticipationContract {
    let address = Address.fromString(this.context.participation);
    return ParticipationContract.bind(address);
  }

  get shares(): SharesContract {
    let address = Address.fromString(this.context.shares);
    return SharesContract.bind(address);
  }

  get trading(): TradingContract {
    let address = Address.fromString(this.context.trading);
    return TradingContract.bind(address);
  }

  get policies(): PolicyManagerContract {
    let address = Address.fromString(this.context.policies);
    return PolicyManagerContract.bind(address);
  }

  get fees(): FeeManagerContract {
    let address = Address.fromString(this.context.fees);
    return FeeManagerContract.bind(address);
  }
}

export class ContextEntities {
  context: Context;

  private _version: Version | null;
  private _fund: Fund | null;
  private _manager: Account | null;
  private _state: State | null;

  constructor(context: Context) {
    this.context = context;
  }

  set fund(value: Fund) {
    this._fund = value;
    this.context.setString('fund', value.id);
  }

  get fund(): Fund {
    if (this._fund == null) {
      this._fund = useFund(this.context.fund);
    }

    return this._fund as Fund;
  }

  set manager(value: Account) {
    this._manager = value;
    this.context.setString('manager', value.id);
  }

  get manager(): Account {
    if (this._manager == null) {
      this._manager = useAccount(this.context.manager);
    }

    return this._manager as Account;
  }

  set version(value: Version) {
    this._version = value;
    this.context.setString('version', value.id);
  }

  get version(): Version {
    if (this._version == null) {
      this._version = useVersion(this.context.version);
    }

    return this._version as Version;
  }

  get state(): State {
    if (this._state == null) {
      // If this getter is used in our code, we can assume that
      // whatever is happening, we want to track a state
      // update in the current mapping context.
      this._state = ensureState(this.context);
    }

    return this._state as State;
  }

  set state(value: State) {
    this._state = value;
  }
}

export class Context extends Entity {
  event: ethereum.Event;
  contracts: ContextContracts;
  entities: ContextEntities;
  api: AbstractionLayer;

  static forBranch(ctx: Context, event: ethereum.Event, branch: string | null = null): Context {
    let context = new DataSourceContext();
    let output = new Context(context.merge([ctx]) as DataSourceContext, event);

    if (branch != null) {
      output.branch = branch;
    }

    return output;
  }

  constructor(ctx: DataSourceContext, event: ethereum.Event) {
    super();

    this.event = event;
    this.entries = ctx.entries;
    this.contracts = new ContextContracts(this);
    this.entities = new ContextEntities(this);
    this.api = new AbstractionLayer(this);
  }

  get fund(): string {
    if (!this.isSet('fund')) {
      log.critical('Missing fund context.', []);
    }

    return this.getString('fund');
  }

  get manager(): string {
    if (!this.isSet('manager')) {
      log.critical('Missing manager context.', []);
    }

    return this.getString('manager');
  }

  get version(): string {
    if (!this.isSet('version')) {
      log.critical('Missing version context.', []);
    }

    return this.getString('version');
  }

  set registry(value: string) {
    this.setString('registry', value);
  }

  get registry(): string {
    if (!this.isSet('registry')) {
      log.critical('Missing registry context.', []);
    }

    return this.getString('registry');
  }

  set branch(value: string) {
    this.setString('branch', value);
  }

  get branch(): string {
    if (!this.isSet('branch')) {
      log.critical('Missing branch context.', []);
    }

    return this.getString('branch');
  }

  set hub(value: string) {
    this.setString('fund.hub', value);
  }

  get hub(): string {
    if (!this.isSet('fund.hub')) {
      log.critical('Missing hub context.', []);
    }

    return this.getString('fund.hub');
  }

  set accounting(value: string) {
    this.setString('fund.accounting', value);
  }

  get accounting(): string {
    if (!this.isSet('fund.accounting')) {
      log.critical('Missing accounting context.', []);
    }

    return this.getString('fund.accounting');
  }

  set participation(value: string) {
    this.setString('fund.participation', value);
  }

  get participation(): string {
    if (!this.isSet('fund.participation')) {
      log.critical('Missing participation context.', []);
    }

    return this.getString('fund.participation');
  }

  set shares(value: string) {
    this.setString('fund.shares', value);
  }

  get shares(): string {
    if (!this.isSet('fund.shares')) {
      log.critical('Missing shares context.', []);
    }

    return this.getString('fund.shares');
  }

  set trading(value: string) {
    this.setString('fund.trading', value);
  }

  get trading(): string {
    if (!this.isSet('fund.trading')) {
      log.critical('Missing trading context.', []);
    }

    return this.getString('fund.trading');
  }

  set fees(value: string) {
    this.setString('fund.fees', value);
  }

  get fees(): string {
    if (!this.isSet('fund.fees')) {
      log.critical('Missing fees context.', []);
    }

    return this.getString('fund.fees');
  }

  set policies(value: string) {
    this.setString('fund.policies', value);
  }

  get policies(): string {
    if (!this.isSet('fund.policies')) {
      log.critical('Missing policies context.', []);
    }

    return this.getString('fund.policies');
  }

  get context(): DataSourceContext {
    let ctx = new DataSourceContext();
    return ctx.merge([this]) as DataSourceContext;
  }
}
