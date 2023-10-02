import { arrayUnique, toBigDecimal } from '@enzymefinance/subgraph-utils';
import {
  createStakeWiseStakingExitRequest,
  ensureStakeWiseVaultToken,
  stakeWiseStakingExitRequestId,
  useStakeWiseStakingPosition,
} from '../../entities/StakeWiseStakingPosition';
import {
  ExitRequestAdded,
  ExitRequestRemoved,
  VaultTokenAdded,
  VaultTokenRemoved,
} from '../../generated/contracts/StakeWiseV3StakingPositionLib4Events';
import { store } from '@graphprotocol/graph-ts';

export function handleExitRequestAdded(event: ExitRequestAdded): void {
  let stakeWiseStakingPosition = useStakeWiseStakingPosition(event.address.toHex());
  let stakeWiseVaultToken = ensureStakeWiseVaultToken(event.params.stakeWiseVaultAddress, event.address);

  let sharesAmount = toBigDecimal(event.params.sharesAmount, 18);

  createStakeWiseStakingExitRequest(
    stakeWiseStakingPosition,
    stakeWiseVaultToken,
    event.params.positionTicket,
    sharesAmount,
  );
}
export function handleExitRequestRemoved(event: ExitRequestRemoved): void {
  let stakeWiseStakingPosition = useStakeWiseStakingPosition(event.address.toHex());
  let stakeWiseVaultToken = ensureStakeWiseVaultToken(event.params.stakeWiseVaultAddress, event.address);

  let id = stakeWiseStakingExitRequestId(stakeWiseStakingPosition, stakeWiseVaultToken, event.params.positionTicket);
  store.remove('StakeWiseStakingExitRequest', id);
}

export function handleVaultTokenAdded(event: VaultTokenAdded): void {
  let stakingPosition = useStakeWiseStakingPosition(event.address.toHex());
  let vaultToken = ensureStakeWiseVaultToken(event.params.stakeWiseVaultAddress, event.address);

  stakingPosition.vaultTokens = arrayUnique(stakingPosition.vaultTokens.concat([vaultToken.id]));
  stakingPosition.save();
}

export function handleVaultTokenRemoved(event: VaultTokenRemoved): void {
  store.remove('StakeWiseVaultToken', event.params.stakeWiseVaultAddress.toHex());
}
