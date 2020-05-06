import { Entity, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { Portfolio, Share, State, Holding, Asset } from '../generated/schema';
import { Context } from '../context';
import { arrayUnique, arrayUniqueBy } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/tokenValue';

export function stateId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + event.block.timestamp.toString();
}

export function createState(shares: Share, holdings: Portfolio, context: Context): State {
  let event = context.event;
  let fund = context.entities.fund;
  let state = new State(stateId(context));
  state.timestamp = event.block.timestamp;
  state.fund = fund.id;
  state.shares = shares.id;
  state.portfolio = holdings.id;
  state.events = [];
  state.save();

  return state;
}

export function ensureState(context: Context): State {
  let fund = context.entities.fund;
  let current = State.load(stateId(context)) as State;
  if (current) {
    return current;
  }

  let previous = useState(fund.state);
  let shares = useShares(previous.shares);
  let holdings = usePortfolio(previous.portfolio);
  let state = createState(shares, holdings, context);

  fund.state = state.id;
  fund.save();

  return state;
}

export function useState(id: string): State {
  let state = State.load(id);
  if (state == null) {
    logCritical('Failed to load fund aggregated state {}.', [id]);
  }

  return state as State;
}

export function shareId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/shares';
}

export function createShares(shares: BigDecimal, cause: Entity | null, context: Context): Share {
  let event = context.event;
  let fund = context.entities.fund;
  let entity = new Share(shareId(context));
  entity.timestamp = event.block.timestamp;
  entity.fund = fund.id;
  entity.shares = shares;
  entity.events = cause ? [cause.getString('id')] : [];
  entity.save();

  return entity;
}

export function ensureShares(cause: Entity, context: Context): Share {
  let shares = Share.load(shareId(context)) as Share;

  if (!shares) {
    let aggregate = context.entities.state;
    let previous = useShares(aggregate.shares);
    shares = createShares(previous.shares, cause, context);
  } else {
    let events = shares.events;
    shares.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    shares.save();
  }

  return shares;
}

export function useShares(id: string): Share {
  let shares = Share.load(id);
  if (shares == null) {
    logCritical('Failed to load fund shares {}.', [id]);
  }

  return shares as Share;
}

export function portfolioId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/holdings';
}

export function createPortfolio(holdings: Holding[], cause: Entity | null, context: Context): Portfolio {
  let event = context.event;
  let fund = context.entities.fund;
  let portfolio = new Portfolio(portfolioId(context));
  portfolio.timestamp = event.block.timestamp;
  portfolio.fund = fund.id;
  portfolio.holdings = holdings.map<string>((item) => item.id);
  portfolio.events = cause ? [cause.getString('id')] : [];
  portfolio.save();

  return portfolio;
}

export function ensurePortfolio(cause: Entity, context: Context): Portfolio {
  let portfolio = Portfolio.load(portfolioId(context)) as Portfolio;

  if (!portfolio) {
    let state = context.entities.state;
    let previous = usePortfolio(state.portfolio).holdings;
    let records = previous.map<Holding>((id) => useHolding(id));
    portfolio = createPortfolio(records, cause, context);
  } else {
    let events = portfolio.events;
    portfolio.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    portfolio.save();
  }

  return portfolio;
}

export function usePortfolio(id: string): Portfolio {
  let porfolio = Portfolio.load(id);
  if (porfolio == null) {
    logCritical('Failed to load fund porfolio {}.', [id]);
  }

  return porfolio as Portfolio;
}

function holdingId(asset: Asset, context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + asset.id + '/' + event.block.timestamp.toString() + '/holding';
}

function createHolding(asset: Asset, quantity: BigDecimal, cause: Entity, context: Context): Holding {
  let event = context.event;
  let fund = context.entities.fund;
  let holding = new Holding(holdingId(asset, context));
  holding.timestamp = event.block.timestamp;
  holding.fund = fund.id;
  holding.asset = asset.id;
  holding.quantity = quantity;
  holding.events = [cause.getString('id')];
  holding.save();

  return holding;
}

export function useHolding(id: string): Holding {
  let holdings = Holding.load(id);
  if (holdings == null) {
    logCritical('Failed to load fund holdings {}.', [id]);
  }

  return holdings as Holding;
}

export function trackFundPortfolio(assets: Asset[], cause: Entity, context: Context): Portfolio {
  let portfolio = ensurePortfolio(cause, context);
  let holdings: Holding[] = portfolio.holdings.map<Holding>((id) => useHolding(id));
  let updates = context.contracts.accounting.getFundHoldings();

  for (let i: i32 = 0; i < assets.length; i++) {
    // By default, we set the value to 0. This is necessary to track records for
    // assets that have been removed from the holdings at least once when they
    // become 0. We will remove these when we track the fund holdings the next
    // time.
    let quantity = BigDecimal.fromString('0');
    let asset = assets[i];

    // Get the quantities for the selected assets from the contract call results.
    for (let j: i32 = 0; j < updates.value0.length; j++) {
      if (updates.value1[j].toHex() == asset.id) {
        quantity = toBigDecimal(updates.value0[j], asset.decimals);
        break;
      }
    }

    // Add the fund holding entry for the current asset unless it's 0.
    if (!quantity.digits.isZero()) {
      let match = findHolding(holdings, asset) as Holding;

      // Re-use the previous holding entry unless it has changed.
      if (!(match != null && match.quantity == quantity)) {
        // Prepend updated items to the array.
        holdings.unshift(createHolding(asset, quantity, cause, context));
      }
    }
  }

  // Eliminate old holdings from the array by only keeping the first copy for each asset.
  portfolio.holdings = uniqueHoldings(holdings).map<string>((item) => item.id);
  portfolio.save();

  let state = context.entities.state;
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(portfolio.events));
  state.portfolio = portfolio.id;
  state.save();

  let fund = context.entities.fund;
  fund.portfolio = portfolio.id;
  fund.save();

  return portfolio;
}

export function trackFundShares(cause: Entity, context: Context): Share {
  let shares = ensureShares(cause, context);
  shares.shares = toBigDecimal(context.contracts.shares.totalSupply());
  shares.save();

  let state = context.entities.state;
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(shares.events));
  state.shares = shares.id;
  state.save();

  let fund = context.entities.fund;
  fund.shares = shares.id;
  fund.save();

  return shares;
}

function findHolding(holdings: Holding[], asset: Asset): Holding | null {
  for (let i: i32 = 0; i < holdings.length; i++) {
    if (holdings[i].asset == asset.id) {
      return holdings[i];
    }
  }

  return null;
}

function uniqueHoldings(holdings: Holding[]): Holding[] {
  let references = holdings.map<string>((item) => item.asset);
  let unique: Holding[] = [];
  for (let i: i32 = 0; i < references.length; i++) {
    if (references.indexOf(references[i]) == i) {
      unique.push(holdings[i]);
    }
  }

  return unique;
}
