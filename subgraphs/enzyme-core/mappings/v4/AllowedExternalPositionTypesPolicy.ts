import { arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureAllowedExternalPositionTypesPolicy } from '../../entities/AllowedExternalPositionTypesPolicy';
import { AllowedExternalPositionTypeAddedForFund } from '../../generated/contracts/AllowedExternalPositionTypesPolicy4Events';

export function handleAllowedExternalPositionTypeAddedForFund(event: AllowedExternalPositionTypeAddedForFund): void {
  let policy = ensureAllowedExternalPositionTypesPolicy(event.params.comptrollerProxy, event.address, event);
  policy.externalPositionTypes = arrayUnique<i32>(
    policy.externalPositionTypes.concat([event.params.externalPositionTypeId.toI32()]),
  );
  policy.save();
}
