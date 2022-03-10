import { logCritical } from '@enzymefinance/subgraph-utils';
import { BigInt } from '@graphprotocol/graph-ts';
import { ExternalPositionType } from '../generated/schema';

export function useExternalPositionType(typeId: BigInt): ExternalPositionType {
  let type = ExternalPositionType.load(typeId.toString());
  if (type == null) {
    logCritical('Failed to load ExternalPositionType {}.', [typeId.toString()]);
  }

  return type as ExternalPositionType;
}
