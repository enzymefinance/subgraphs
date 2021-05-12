import { logCritical } from '@enzymefinance/subgraph-utils';
import { BigDecimal } from '@graphprotocol/graph-ts';
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
  let vault = Vault.load(id) as Vault;
  if (vault == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return vault;
}

export function createVault(event: NewFundCreated): Vault {
  let id = event.params.vaultProxy.toHex();

  let vault = new Vault(id);
  let shares = createShareState(
    vault,
    { totalSupply: BigDecimal.fromString('0'), outstandingForFees: BigDecimal.fromString('0') },
    event,
    null,
  );
  let portfolio = createPortfolioState([], vault, event, null);

  let feeState = createFeeState([], vault, event, null);
  let calculations = createCalculationState(vault, event, null);
  let state = createVaultState(shares, portfolio, feeState, calculations, 0, vault, event);

  vault.name = event.params.fundName;
  vault.inception = event.block.timestamp;
  vault.release = ensureRelease(event.address.toHex(), event).id;
  vault.accessor = event.params.comptrollerProxy.toHex();
  vault.manager = ensureManager(event.params.fundOwner, event).id;
  vault.creator = ensureAccount(event.params.creator, event).id;
  vault.authUsers = new Array<string>();
  vault.trackedAssets = new Array<string>();
  vault.investmentCount = 0;
  vault.shares = shares.id;
  vault.portfolio = portfolio.id;
  vault.feeState = feeState.id;
  vault.calculations = calculations.id;
  vault.state = state.id;

  vault.save();

  trackNetworkFunds(event);

  return vault;
}
