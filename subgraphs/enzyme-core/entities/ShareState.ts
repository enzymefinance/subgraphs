import { Address, BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { arrayUnique } from '../../../utils/utils/array';
import { logCritical } from '../../../utils/utils/logging';
import { toBigDecimal } from '../../../utils/utils/math';
import { ShareState, Vault } from '../generated/schema';
import { VaultLibContract } from '../generated/VaultLibContract';
import { ensureVaultState, useVaultState } from './VaultState';

class CreateSharesArgs {
  totalSupply: BigDecimal;
  outstandingForFees: BigDecimal;
}

export function shareStateId(fund: Vault, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/shares';
}

export function createShareState(
  fund: Vault,
  args: CreateSharesArgs,
  event: ethereum.Event,
  cause: Entity | null,
): ShareState {
  let shareState = new ShareState(shareStateId(fund, event));
  shareState.timestamp = event.block.timestamp;
  shareState.vault = fund.id;
  shareState.totalSupply = args.totalSupply;
  shareState.outstandingForFees = args.outstandingForFees;
  shareState.events = cause ? [cause.getString('id')] : new Array<string>();
  shareState.save();

  return shareState;
}

export function ensureShareState(vault: Vault, event: ethereum.Event, cause: Entity): ShareState {
  let shares = ShareState.load(shareStateId(vault, event)) as ShareState;

  if (!shares) {
    let state = useVaultState(vault.state);
    let previous = useShareState(state.shares);
    shares = createShareState(
      vault,
      {
        totalSupply: previous.totalSupply,
        outstandingForFees: previous.outstandingForFees,
      },
      event,
      cause,
    );
  } else {
    let events = shares.events;
    shares.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    shares.save();
  }

  return shares;
}

export function useShareState(id: string): ShareState {
  let shares = ShareState.load(id) as ShareState;
  if (shares == null) {
    logCritical('Failed to load fund shares {}.', [id]);
  }

  return shares;
}

export function trackShareState(fund: Vault, event: ethereum.Event, cause: Entity): ShareState {
  let vaultAddress = Address.fromString(fund.id);
  let contract = VaultLibContract.bind(vaultAddress);
  let totalSupply = contract.totalSupply();
  let outstanding = contract.balanceOf(vaultAddress);

  let shareState = ensureShareState(fund, event, cause);
  shareState.totalSupply = toBigDecimal(totalSupply);
  shareState.outstandingForFees = toBigDecimal(outstanding);
  shareState.save();

  let vaultState = ensureVaultState(fund, event);
  let events = vaultState.events;
  vaultState.events = arrayUnique<string>(events.concat(shareState.events));
  vaultState.shares = shareState.id;
  vaultState.investmentCount = fund.investmentCount;
  vaultState.save();

  fund.shares = shareState.id;

  // first investment state is needed for performance calculations
  // (initial state for asset prices, etc.)
  if (fund.firstInvestmentState == null && !totalSupply.isZero()) {
    fund.firstInvestmentState = vaultState.id;
  }
  fund.save();

  return shareState;
}
