import { Address, DataSourceTemplate } from '@graphprotocol/graph-ts';
import { Fund, Version } from '../generated/schema';
import { hexToAscii } from '../utils/hexToAscii';
import { ensureManager } from './Account';
import { ensureVersion } from './Version';
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

  fund = new Fund(hubAddress.toHex());

  ensureFees(fund);

  let hubContract = HubContract.bind(Address.fromString(fund.id));
  fund.name = hexToAscii(hubContract.name());
  fund.inception = hubContract.creationTime();

  // Start observing the hub contract.
  createFundDataSources(fund);

  return updateFund(fund);
}

export function updateFund(fund: Fund): Fund {
  let hubContract = HubContract.bind(Address.fromString(fund.id));
  let sharesContract = SharesContract.bind(hubContract.shares());

  let manager = ensureManager(hubContract.manager());
  let version = ensureVersion(hubContract.version());

  fund.holdings = ensureFundHoldings(fund).map<string>((holding) => holding.id);
  fund.investableAssets = investableAssets(fund, version);
  fund.version = version.id;
  fund.manager = manager.id;
  fund.active = !hubContract.isShutDown();
  fund.shares = sharesContract.totalSupply();
  fund.save();

  return fund;
}

function investableAssets(fund: Fund, version: Version): string[] {
  let hubContract = HubContract.bind(Address.fromString(fund.id));
  let participationContract = ParticipationContract.bind(hubContract.participation());

  let assets = version.assets as string[];
  let investable: string[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    if (participationContract.investAllowed(Address.fromString(assets[i]))) {
      investable.push(assets[i]);
    }
  }

  return arrayUnique<string>(investable);
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
}
