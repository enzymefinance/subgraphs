import { BigDecimal } from '@graphprotocol/graph-ts';
import { ONE_BD, saveDivideBigDecimal } from '@enzymefinance/subgraph-utils';

export function toEth(usdBasedValue: BigDecimal, usdEth: BigDecimal): BigDecimal {
  return saveDivideBigDecimal(ONE_BD, saveDivideBigDecimal(usdBasedValue, usdEth));
}
