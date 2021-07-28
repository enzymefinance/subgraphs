import { BigDecimal, Address, BigInt, Entity } from '@graphprotocol/graph-ts';
import { tokenBalance, toBigDecimal, hourCloseTime, dayCloseTime, monthCloseTime } from '@enzymefinance/subgraph-utils';
import {
  Vault,
  Asset,
  CurrentHolding,
  HistoricalHolding,
  HourlyPortfolio,
  DailyPortfolio,
  MonthlyPortfolio,
} from '../generated/schema';

function getOrCreateHolding(vault: Vault, asset: Asset, timestamp: BigInt): CurrentHolding {
  let id = vault.id + '/' + asset.id;
  let holding = CurrentHolding.load(id);

  if (holding == null) {
    holding = new CurrentHolding(id);
    holding.asset = asset.id;
    holding.vault = vault.id;
    holding.tracked = false;
    holding.external = false;
    holding.portfolio = false;
    holding.timestamp = timestamp;
    holding.balance = BigDecimal.fromString('0');
    holding.save();
  }

  return holding as CurrentHolding;
}

function createHistoricalHolding(holding: CurrentHolding): HistoricalHolding {
  // Create a historical snapshot of the holding entity.
  let historical = new HistoricalHolding(holding.id + '/' + holding.timestamp.toString());
  historical.vault = holding.vault;
  historical.asset = holding.asset;
  historical.timestamp = holding.timestamp;
  historical.balance = holding.balance;
  historical.tracked = holding.tracked;
  historical.external = holding.external;
  historical.portfolio = holding.portfolio;
  historical.holding = holding.id;
  historical.save();

  return historical;
}

function maintainPortfolioHistory(vault: Vault, holding: CurrentHolding): void {
  let historical = createHistoricalHolding(holding);
  // Bail out early if the historical record is already registered in the current portfolio.
  if (historical.portfolio && vault.portfolio.includes(historical.id)) {
    return;
  }

  // The asset address is the second segment of the id. This is more efficient than loading
  // the holding entity and then retrieveing the asset id from that.
  let assets = vault.portfolio.map<string>((item) => item.split('/')[1]);
  // Bail out early if the asset is not supposed to be tracked but already isn't anyways.
  if (!historical.portfolio && !assets.includes(historical.asset)) {
    return;
  }

  // Clean up the existing portfolio (remove the asset that corresponds to the one from the
  // historical holding record).
  let previous = vault.portfolio;
  let portfolio = new Array<string>();
  for (let i: i32 = 0; i < previous.length; i++) {
    let current = previous[i];
    let asset = current.split('/')[1];
    if (historical.asset != asset) {
      portfolio.push(current);
    }
  }

  vault.portfolio = historical.portfolio ? portfolio.concat([historical.id]) : portfolio;
  vault.timestamp = historical.timestamp;
  vault.save();

  let hour = hourCloseTime(historical.timestamp);
  let hourlyPortfolio = new HourlyPortfolio(vault.id + '/hourly/' + hour.toString());
  hourlyPortfolio.timestamp = historical.timestamp;
  hourlyPortfolio.vault = vault.id;
  hourlyPortfolio.holdings = vault.portfolio;
  hourlyPortfolio.close = hour;
  hourlyPortfolio.save();

  let day = dayCloseTime(historical.timestamp);
  let dailyPortfolio = new DailyPortfolio(vault.id + '/daily/' + day.toString());
  dailyPortfolio.timestamp = historical.timestamp;
  dailyPortfolio.vault = vault.id;
  dailyPortfolio.holdings = vault.portfolio;
  dailyPortfolio.close = day;
  dailyPortfolio.save();

  let month = monthCloseTime(historical.timestamp);
  let monthlyPortfolio = new MonthlyPortfolio(vault.id + '/monthly/' + month.toString());
  monthlyPortfolio.timestamp = historical.timestamp;
  monthlyPortfolio.vault = vault.id;
  monthlyPortfolio.holdings = vault.portfolio;
  monthlyPortfolio.close = month;
  monthlyPortfolio.save();
}

export function updateHoldingBalance(vault: Vault, asset: Asset, timestamp: BigInt): CurrentHolding {
  let holding = getOrCreateHolding(vault, asset, timestamp);

  // TODO: Is it reasonable to assume that we can default this to `0` if the balance cannot be fetched.
  let balanceOrNull = tokenBalance(Address.fromString(asset.id), Address.fromString(vault.id));
  let currentBalance =
    balanceOrNull == null ? BigDecimal.fromString('0') : toBigDecimal(balanceOrNull as BigInt, asset.decimals);
  let previousBalance = holding.balance;

  // Update the holding balance.
  holding.balance = currentBalance;
  holding.timestamp = timestamp;
  holding.save();

  // Update the total value locked (in the entire network) of this asset.
  asset.total = asset.total.minus(previousBalance).plus(currentBalance);
  asset.save();

  // Create a historical snapshot of the holding entity.
  maintainPortfolioHistory(vault, holding);

  return holding;
}

export function updateTrackedAsset(vault: Vault, asset: Asset, timestamp: BigInt, tracked: boolean): CurrentHolding {
  let holding = getOrCreateHolding(vault, asset, timestamp);
  holding.tracked = tracked;
  holding.portfolio = holding.tracked || holding.external;
  holding.save();

  // Create a historical snapshot of the holding entity.
  maintainPortfolioHistory(vault, holding);

  return holding;
}

export function updateExternalPosition(
  vault: Vault,
  asset: Asset,
  timestamp: BigInt,
  external: boolean,
): CurrentHolding {
  let holding = getOrCreateHolding(vault, asset, timestamp);
  holding.external = external;
  holding.portfolio = holding.tracked || holding.external;
  holding.save();

  // Create a historical snapshot of the holding entity.
  maintainPortfolioHistory(vault, holding);

  return holding;
}
