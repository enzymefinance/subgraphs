import { Address, DataSourceTemplate } from '@graphprotocol/graph-ts';
import { Fund } from '../generated/schema';
import { hexToAscii } from '../utils/hexToAscii';
import { ensureManager } from './Account';
import { ensureVersion, versionAssets } from './Version';
import { HubContract } from '../generated/v2/VersionContract/HubContract';
import { SharesContract } from '../generated/templates/v2/SharesContract/SharesContract';
import { ParticipationContract } from '../generated/templates/v2/ParticipationContract/ParticipationContract';
import { arrayUnique } from '../utils/arrayUnique';
import { ensureFees } from './Fee';
import { ensureFundHoldings } from './Holding';

export function ensureFund(hubAddress: Address): Fund {
  let fund = Fund.load(hubAddress.toHex()) as Fund;
  if (fund) {
    return fund;
  }

  let hubContract = HubContract.bind(hubAddress);
  let hubRoutes = hubContract.routes();

  let participationAddress = hubRoutes.value2;
  let sharesAddress = hubRoutes.value4;

  let sharesContract = SharesContract.bind(sharesAddress);
  let participationContract = ParticipationContract.bind(participationAddress);

  fund = new Fund(hubAddress.toHex());

  let manager = ensureManager(hubContract.manager());
  let version = ensureVersion(hubContract.version());

  ensureFees(fund);

  fund.name = hexToAscii(hubContract.name());
  fund.active = !hubContract.isShutDown();
  fund.version = version.id;
  fund.manager = manager.id;
  fund.inception = hubContract.creationTime();
  fund.shares = sharesContract.totalSupply();

  let assets = versionAssets(version).map<string>((item) => item.id);
  let allowed: string[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    if (participationContract.investAllowed(Address.fromString(assets[i]))) {
      allowed.push(assets[i]);
    }
  }

  fund.investableAssets = arrayUnique<string>(allowed);

  let holdings = ensureFundHoldings(fund);
  fund.holdings = holdings.map<string>((holding) => holding.id);

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
