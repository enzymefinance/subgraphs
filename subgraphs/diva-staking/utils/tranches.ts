import { BigInt } from '@graphprotocol/graph-ts';

const tranches = [
  {
    threshold: BigInt.fromI32(10_000),
  },
  {
    threshold: BigInt.fromI32(20_000),
  },
  {
    threshold: BigInt.fromI32(30_000),
  },
  {
    threshold: BigInt.fromI32(40_000),
  },
  {
    threshold: BigInt.fromI32(50_000),
  },
  {
    threshold: BigInt.fromI32(60_000),
  },
  {
    threshold: BigInt.fromI32(70_000),
  },
  {
    threshold: BigInt.fromI32(80_000),
  },
  {
    threshold: BigInt.fromI32(90_000),
  },
  {
    threshold: BigInt.fromI32(100_000),
  },
];

// vaultsGavBeforeDeposit 10_500
// investmentAmount 15_000
export function getDepositTranches(
  vaultsGavBeforeDeposit: BigInt,
  investmentAmount: BigInt,
): { amount: BigInt; id: number }[] {
  let tranchesDepositedTo: { amount: BigInt; id: number }[] = [];
  let amountLeftToClassify = investmentAmount;
  let vaultsGav = vaultsGavBeforeDeposit;

  for (let i = 0; i < tranches.length; i++) {
    let currentTranche = tranches[i];

    // if gav is greater than tranche threshold skip that tranche
    if (currentTranche.threshold < vaultsGav) {
      continue;
    }

    let vaultsGavAndAmountLeftToClassify = vaultsGav.plus(amountLeftToClassify); // 25_500

    // check if invested amount left is lower than threshold, if yes then full investment amount left belongs to that tranche completly
    if (currentTranche.threshold >= vaultsGavAndAmountLeftToClassify) {
      tranchesDepositedTo.push({
        amount: amountLeftToClassify,
        id: i,
      });
      break;
    }

    let amountInvestedToCurrentTranche = currentTranche.threshold.minus(vaultsGav); // 20_000 - 10_500 = 9_500
    amountLeftToClassify = amountLeftToClassify.minus(amountInvestedToCurrentTranche); // 15_000 - 9_500 = 5_500
    tranchesDepositedTo.push({
      amount: amountInvestedToCurrentTranche,
      id: i,
    });

    vaultsGav = vaultsGav.plus(amountInvestedToCurrentTranche); // 20_000
  }

  return tranchesDepositedTo;
}
