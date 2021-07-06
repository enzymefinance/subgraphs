export let addTrackedAssetsSelector = '0x848f3a59';
export let addTrackedAssetsMethod = 'addTrackedAssets(address,bytes,bytes)';
export let addTrackedAssetsType = 'ADD_TRACKED_ASSETS';

export let removeTrackedAssetsSelector = '0x848f3a59';
export let removeTrackedAssetsMethod = 'removeTrackedAssets(address,bytes,bytes)';
export let removeTrackedAssetsType = 'REMOVE_TRACKED_ASSETS';

export let approveAssetsSelector = '0x3377e18a';
export let approveAssetsMethod = 'approveAssets(address,bytes,bytes)';
export let approveAssetsType = 'APPROVE_ASSETS';

export let takeOrderSelector = '0x03e38a2b';
export let takeOrderMethod = 'takeOrder(address,bytes,bytes)';
export let takeOrderType = 'TAKE_ORDER';

export let lendSelector = '0x099f7515';
export let lendMethod = 'lend(address,bytes,bytes)';
export let lendType = 'LEND';

export let redeemSelector = '0xc29fa9dd';
export let redeemMethod = 'redeem(address,bytes,bytes)';
export let redeemType = 'REDEEM';

export let stakeSelector = '0xfa7dd04d';
export let stakeMethod = 'stake(address,bytes,bytes)';
export let stakeType = 'STAKE';

export let unstakeSelector = '0x68e30677';
export let unstakeMethod = 'unstake(address,bytes,bytes)';
export let unstakeType = 'UNSTAKE';

export let claimRewardsSelector = '0xb9dfbacc';
export let claimRewardsMethod = 'claimRewards(address,bytes,bytes)';
export let claimRewardsType = 'CLAIM_REWARDS';

export let claimRewardsAndReinvestSelector = '0xdfd5ee0f';
export let claimRewardsAndReinvestMethod = 'claimRewardsAndReinvest(address,bytes,bytes)';
export let claimRewardsAndReinvestType = 'CLAIM_REWARDS_AND_REINVEST';

export let claimRewardsAndSwapSelector = '0x1d51f49b';
export let claimRewardsAndSwapMethod = 'claimRewardsAndSwap(address,bytes,bytes)';
export let claimRewardsAndSwapType = 'CLAIM_REWARDS_AND_SWAP';

export let lendAndStakeSelector = '0x29fa046e';
export let lendAndStakeMethod = 'lendAndStake(address,bytes,bytes)';
export let lendAndStakeType = 'LEND_AND_STAKE';

export let unstakeAndRedeemSelector = '0x8334eb99';
export let unstakeAndRedeemMethod = 'unstakeAndRedeem(address,bytes,bytes)';
export let unstakeAndRedeemType = 'UNSTAKE_AND_REDEEM';

export function convertSelectorToType(selector: string): string {
  if (selector == addTrackedAssetsSelector) {
    return addTrackedAssetsType;
  }

  if (selector == removeTrackedAssetsSelector) {
    return removeTrackedAssetsType;
  }

  if (selector == approveAssetsSelector) {
    return approveAssetsType;
  }

  if (selector == takeOrderSelector) {
    return takeOrderType;
  }

  if (selector == lendSelector) {
    return lendType;
  }

  if (selector == redeemSelector) {
    return redeemType;
  }

  if (selector == stakeSelector) {
    return stakeType;
  }

  if (selector == unstakeSelector) {
    return unstakeType;
  }

  if (selector == claimRewardsSelector) {
    return claimRewardsType;
  }

  if (selector == claimRewardsAndReinvestSelector) {
    return claimRewardsAndReinvestType;
  }

  if (selector == claimRewardsAndSwapSelector) {
    return claimRewardsAndSwapType;
  }

  if (selector == lendAndStakeSelector) {
    return lendAndStakeType;
  }

  if (selector == unstakeAndRedeemSelector) {
    return unstakeAndRedeemType;
  }

  return 'UNKNOWN';
}
