import { Address, DataSourceTemplate, log, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { Fund } from '../generated/schema';
import { hexToAscii } from '../utils/hexToAscii';
import { ensureManager } from './Account';
import { ensureVersion, versionAssets } from './Version';
import { HubContract } from '../generated/v2/VersionContract/HubContract';
import { SharesContract } from '../generated/templates/v2/SharesContract/SharesContract';
import { FeeManagerContract } from '../generated/templates/v2/FeeManagerContract/FeeManagerContract';
import { ParticipationContract } from '../generated/templates/v2/ParticipationContract/ParticipationContract';
import { arrayUnique } from '../utils/arrayUnique';
import { PerformanceFeeContract } from '../generated/v2/VersionContract/PerformanceFeeContract';
import { ManagementFeeContract } from '../generated/v2/VersionContract/ManagementFeeContract';

export function ensureFund(hubAddress: Address): Fund {
  let fund = Fund.load(hubAddress.toHex()) as Fund;
  if (fund) {
    return fund;
  }

  let hubContract = HubContract.bind(hubAddress);
  let routes = hubContract.routes();

  let feeManagerAddress = routes.value1;
  let participationAddress = routes.value2;
  let sharesAddress = routes.value4;

  let sharesContract = SharesContract.bind(sharesAddress);
  let feeManagerContract = FeeManagerContract.bind(feeManagerAddress);
  let participationContract = ParticipationContract.bind(participationAddress);

  let manager = ensureManager(hubContract.manager());
  let version = ensureVersion(hubContract.version());

  fund = new Fund(hubAddress.toHex());
  fund.name = hexToAscii(hubContract.name());
  fund.active = !hubContract.isShutDown();
  fund.version = version.id;
  fund.manager = manager.id;
  fund.inception = hubContract.creationTime();
  fund.shares = sharesContract.totalSupply();
  fund.performanceFee = BigDecimal.fromString('0');
  fund.managementFee = BigDecimal.fromString('0');

  let assets = versionAssets(version).map<string>((item) => item.id);
  let allowed: string[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    if (participationContract.investAllowed(Address.fromString(assets[i]))) {
      allowed.push(assets[i]);
    }
  }

  fund.investableAssets = arrayUnique<string>(allowed);

  let managementFeeAddress = feeManagerContract.fees(BigInt.fromI32(0));
  if (managementFeeAddress) {
    let managementFeeContract = ManagementFeeContract.bind(managementFeeAddress);
    let managementFeeRate = managementFeeContract.managementFeeRate(feeManagerContract._address);
    fund.managementFee = managementFeeRate.divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal());
  }

  let performanceFeeAddress = feeManagerContract.fees(BigInt.fromI32(1));
  if (performanceFeeAddress) {
    let performanceFeeContract = PerformanceFeeContract.bind(performanceFeeAddress);
    let performanceFeeRate = performanceFeeContract.performanceFeeRate(feeManagerContract._address);
    fund.performanceFee = performanceFeeRate.divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal());
    fund.performanceFeePeriod = performanceFeeContract.performanceFeePeriod(feeManagerContract._address);
  }

  fund.save();

  // Start observing the hub contract.
  createFundDataSources(fund);

  return fund;
}

function createFundDataSources(fund: Fund): void {
  let hubContract = HubContract.bind(Address.fromString(fund.id));
  let routes = hubContract.routes();

  DataSourceTemplate.create('v2/HubContract', [fund.id]);
  DataSourceTemplate.create('v2/AccountingContract', [routes.value0.toHex()]);
  DataSourceTemplate.create('v2/FeeManagerContract', [routes.value1.toHex()]);
  DataSourceTemplate.create('v2/ParticipationContract', [routes.value2.toHex()]);
  DataSourceTemplate.create('v2/PolicyManagerContract', [routes.value3.toHex()]);
  DataSourceTemplate.create('v2/SharesContract', [routes.value4.toHex()]);
  DataSourceTemplate.create('v2/TradingContract', [routes.value5.toHex()]);
  DataSourceTemplate.create('v2/VaultContract', [routes.value6.toHex()]);
}
