import { logCritical } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { ArbitraryLoanTotalNominalDeltaOracleModule } from '../generated/schema';

export function useArbitraryLoanTotalNominalDeltaOracleModule(id: string): ArbitraryLoanTotalNominalDeltaOracleModule {
  let arbitraryLoanTotalNominalDeltaOracleModule = ArbitraryLoanTotalNominalDeltaOracleModule.load(id);
  if (arbitraryLoanTotalNominalDeltaOracleModule == null) {
    logCritical('Failed to load ArbitraryLoanTotalNominalDeltaOracleModule {}.', [id]);
  }

  return arbitraryLoanTotalNominalDeltaOracleModule as ArbitraryLoanTotalNominalDeltaOracleModule;
}

export function getArbitraryLoanTotalNominalDeltaOracleModuleID(
  externalPositionAddress: Address,
  acccountingModuleAddress: Address,
): string {
  return externalPositionAddress.toHex() + acccountingModuleAddress.toHex();
}

export function createArbitraryLoanTotalNominalDeltaOracleModule(
  externalPositionAddress: Address,
  acccountingModuleAddress: Address,
  oracle: Address,
  stalenessThreshold: BigInt,
): ArbitraryLoanTotalNominalDeltaOracleModule {
  let arbitraryLoanTotalNominalDeltaOracleModule = new ArbitraryLoanTotalNominalDeltaOracleModule(
    getArbitraryLoanTotalNominalDeltaOracleModuleID(externalPositionAddress, acccountingModuleAddress),
  );

  arbitraryLoanTotalNominalDeltaOracleModule.externalPosition = externalPositionAddress.toHex();
  arbitraryLoanTotalNominalDeltaOracleModule.oracle = oracle;
  arbitraryLoanTotalNominalDeltaOracleModule.stalenessThreshold = stalenessThreshold.toI32();

  arbitraryLoanTotalNominalDeltaOracleModule.save();

  return arbitraryLoanTotalNominalDeltaOracleModule;
}
