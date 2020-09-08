import { ethereum } from '@graphprotocol/graph-ts';
import { Fund, Portfolio, Share, State } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { usePortfolio } from './Portfolio';
import { useShares } from './Shares';

export function stateId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString();
}

export function createState(shares: Share, holdings: Portfolio, fund: Fund, event: ethereum.Event): State {
  let state = new State(stateId(fund, event));
  state.timestamp = event.block.timestamp;
  state.fund = fund.id;
  state.shares = shares.id;
  state.portfolio = holdings.id;
  //   state.payouts = payouts.id;
  state.events = [];
  state.save();

  // load additional infos

  return state;
}

export function ensureState(fund: Fund, event: ethereum.Event): State {
  let current = State.load(stateId(fund, event)) as State;
  if (current) {
    return current;
  }

  let previous = useState(fund.state);
  let shares = useShares(previous.shares);
  let holdings = usePortfolio(previous.portfolio);
  //   let payouts = usePayout(previous.payouts);
  let state = createState(shares, holdings, fund, event);

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
