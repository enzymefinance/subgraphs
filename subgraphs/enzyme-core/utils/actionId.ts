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

export enum LiquityDebtPositionActionId {
  OpenTrove = 0,
  AddCollateral = 1,
  RemoveCollateral = 2,
  Borrow = 3,
  Repay = 4,
  CloseTrove = 5,
}

export enum ConvexVotingPositionActionId {
  Lock = 0,
  Relock = 1,
  Withdraw = 2,
  ClaimRewards = 3,
  Delegate = 4,
}

export enum ArbitraryLoanPositionActionId {
  ConfigureLoan = 0,
  UpdateBorrowableAmount = 1,
  CallOnAccountingModule = 2,
  Reconcile = 3,
  CloseLoan = 4,
}
