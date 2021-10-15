import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import { AssetRegistration } from '../entities/Registration';
import { releaseV2Address, releaseV3Address, releaseV4Address } from '../generated/configuration';

export function sortRegistrations(a: AssetRegistration, b: AssetRegistration): i32 {
  const aWeight = getVersionWeight(Address.fromString(a.version.toHex()));
  const bWeight = getVersionWeight(Address.fromString(b.version.toHex()));

  return bWeight - aWeight;
}

function getVersionWeight(version: Address): i32 {
  if (version == ZERO_ADDRESS) {
    return 0;
  } else if (version == releaseV2Address) {
    return 2;
  } else if (version == releaseV3Address) {
    return 3;
  } else if (version == releaseV4Address) {
    return 4;
  }

  return 0;
}
