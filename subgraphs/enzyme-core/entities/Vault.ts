import { BigDecimal } from '@graphprotocol/graph-ts';
import { logCritical } from '../../../utils/utils/logging';
import { NewFundCreated } from '../generated/FundDeployerContract';
import { Vault } from '../generated/schema';
import { ensureAccount, ensureManager } from './Account';
import { createCalculationState } from './CalculationState';
import { createFeeState } from './FeeState';
import { trackNetworkFunds } from './NetworkState';
import { createPortfolioState } from './PortfolioState';
import { ensureRelease } from './Release';
import { createShareState } from './ShareState';
import { createVaultState } from './VaultState';

export function useVault(id: string): Vault {
  let fund = Vault.load(id) as Vault;
  if (fund == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return fund;
}

export function createVault(event: NewFundCreated): Vault {
  let id = event.params.vaultProxy.toHex();

  let fund = new Vault(id);
  let shares = createShareState(
    fund,
    { totalSupply: BigDecimal.fromString('0'), outstandingForFees: BigDecimal.fromString('0') },
    event,
    null,
  );
  let portfolio = createPortfolioState([], fund, event, null);

  let feeState = createFeeState([], fund, event, null);
  let calculations = createCalculationState(fund, event, null);
  let state = createVaultState(shares, portfolio, feeState, calculations, 0, fund, event);

  fund.name = event.params.fundName;
  fund.inception = event.block.timestamp;
  fund.release = ensureRelease(event.address.toHex(), event).id;
  fund.accessor = event.params.comptrollerProxy.toHex();
  fund.manager = ensureManager(event.params.fundOwner, event).id;
  fund.creator = ensureAccount(event.params.creator, event).id;
  fund.authUsers = new Array<string>();
  fund.trackedAssets = new Array<string>();
  fund.investmentCount = 0;
  fund.shares = shares.id;
  fund.portfolio = portfolio.id;
  fund.feeState = feeState.id;
  fund.calculations = calculations.id;
  fund.state = state.id;

  fund.save();

  trackNetworkFunds(event);

  return fund;
}
