export enum AaveDebtPositionActionId {
  AddCollateral = 0,
  RemoveCollateral = 1,
  Borrow = 2,
  RepayBorrow = 3,
  ClaimRewards = 4,
}

export enum AaveV3DebtPositionActionId {
  AddCollateral = 0,
  RemoveCollateral = 1,
  Borrow = 2,
  RepayBorrow = 3,
  SetEMode = 4,
  SetUseReserveAsCollateral = 5,
}

export enum CompoundDebtPositionActionId {
  AddCollateral = 0,
  RemoveCollateral = 1,
  Borrow = 2,
  RepayBorrow = 3,
  ClaimComp = 4,
}

export enum UniswapV3LiquidityPositionActionId {
  Mint = 0,
  AddLiquidity = 1,
  RemoveLiquidity = 2,
  Collect = 3,
  Purge = 4,
}

export enum MapleLiquidityPositionActionId {
  LendV1 = 0,
  LendAndStakeV1 = 1,
  IntendToRedeemV1 = 2,
  RedeemV1 = 3,
  StakeV1 = 4,
  UnstakeV1 = 5,
  UnstakeAndRedeemV1 = 6,
  ClaimInterestV1 = 7,
  ClaimRewardsV1 = 8,
  LendV2 = 9,
  RequestRedeemV2 = 10,
  RedeemV2 = 11,
  CancelRedeemV2 = 12,
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

export enum TheGraphDelegationPositionActionId {
  Delegate = 0,
  Undelegate = 1,
  Withdraw = 2,
}

export enum KilnStakingPositionActionId {
  Stake = 0,
  ClaimFees = 1,
  SweepEth = 2,
  Unstake = 3,
  PausePositionValue = 4,
  UnpausePositionValue = 5,
}
