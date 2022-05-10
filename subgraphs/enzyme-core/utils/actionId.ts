export const enum AaveDebtPositionActionId {
  AddCollateral = 0,
  RemoveCollateral = 1,
  Borrow = 2,
  RepayBorrow = 3,
  ClaimRewards = 4,
}

export const enum CompoundDebtPositionActionId {
  AddCollateral = 0,
  RemoveCollateral = 1,
  Borrow = 2,
  RepayBorrow = 3,
  ClaimComp = 4,
}

export const enum UniswapV3LiquidityPositionActionId {
  Mint = 0,
  AddLiquidity = 1,
  RemoveLiquidity = 2,
  Collect = 3,
  Purge = 4,
}

export enum MapleLiquidityPositionActionId {
  Lend = 0,
  LendAndStake = 1,
  IntendToRedeem = 2,
  Redeem = 3,
  Stake = 4,
  Unstake = 5,
  UnstakeAndRedeem = 6,
  ClaimInterest = 7,
  ClaimRewards = 8,
}
