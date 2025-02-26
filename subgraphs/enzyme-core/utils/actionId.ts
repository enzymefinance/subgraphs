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
  ClaimRewards = 6,
  Sweep = 7,
  ClaimMerklRewards = 8,
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
  ClaimCollateral = 6,
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

export enum StakeWiseV3StakingPositionActionId {
  Stake = 0,
  Redeem = 1,
  EnterExitQueue = 2,
  ClaimExitedAssets = 3,
}

export enum LidoWithdrawalsActionId {
  RequestWithdrawals = 0,
  ClaimWithdrawals = 1,
}

export enum StaderWithdrawalsActionId {
  RequestWithdrawals = 0,
  ClaimWithdrawals = 1,
}

export enum PendleV2ActionId {
  BuyPrincipalToken = 0,
  SellPrincipalToken = 1,
  AddLiquidity = 2,
  RemoveLiquidity = 3,
  ClaimRewards = 4,
}

export enum GMXV2LeverageTradingActionId {
  CreateOrder = 0,
  UpdateOrder = 1,
  CancelOrder = 2,
  ClaimFundingFees = 3,
  ClaimCollateral = 4,
  Sweep = 5,
}

// export enum MorphoBlueActionId {
//   Lend = 0,
//   Redeem = 1,
//   AddCollateral = 2,
//   RemoveCollateral = 3,
//   Borrow = 4,
//   Repay = 5,
// }

export enum AliceActionId {
  PlaceOrder = 0,
  RefundOrder = 1,
  Sweep = 2,
}
