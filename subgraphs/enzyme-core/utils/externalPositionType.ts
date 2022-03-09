export const enum ExternalPositionType {
  COMPOUND_DEBT_POSITION = 0,
  UNISWAP_V3_POOL = 1,
  AAVE_DEBT_POSITION = 2,
}

export const enum AaveDebtPositionActionId {
  AddCollateral = 0,
  RemoveCollateral = 1,
  Borrow = 2,
  RepayBorrow = 3,
  ClaimStkAave = 4,
}

export const enum CompoundDebtPositionActionId {
  AddCollateral = 0,
  RemoveCollateral = 1,
  Borrow = 2,
  RepayBorrow = 3,
  ClaimComp = 4,
}
