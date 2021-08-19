import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureMaxConcentrationPolicy } from '../../entities/MaxConcentrationPolicy';
import { MaxConcentrationSet } from '../../generated/MaxConcentration2Contract';

export function handleMaxConcentrationSet(event: MaxConcentrationSet): void {
  let policy = ensureMaxConcentrationPolicy(event.params.comptrollerProxy, event.address, event);
  policy.maxConcentration = toBigDecimal(event.params.value);
  policy.save();
}
