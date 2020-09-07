import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Asset, FundDeployer } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { StandardERC20Contract } from '../generated/StandardERC20Contract';

export function useFundDeployer(id: string): FundDeployer {
  let fundDeployer = FundDeployer.load(id);
  if (fundDeployer == null) {
    logCritical('Failed to load fund deployer {}.', [id]);
  }

  return fundDeployer as FundDeployer;
}

export function ensureFundDeployer(address: Address): FundDeployer {
  let fundDeployer = FundDeployer.load(address.toHex()) as FundDeployer;
  if (fundDeployer) {
    return fundDeployer;
  }

  fundDeployer = new FundDeployer(address.toHex());
  fundDeployer.current = false;
  fundDeployer.currentStart = BigInt.fromI32(0);
  fundDeployer.save();

  return fundDeployer;
}
