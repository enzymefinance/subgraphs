import {
  Configurator,
  Contexts,
  DataSourceTemplateUserDeclaration,
  DataSourceUserDeclaration,
  SdkUserDeclaration,
  Template,
} from '@enzymefinance/subgraph-cli';
import * as persistent from './config/persistent';
import * as v2 from './config/v2';
import * as v3 from './config/v3';
import * as v4 from './config/v4';
import { arbitrum } from './contexts/arbitrum';
import { base } from './contexts/base';
import { ethereum } from './contexts/ethereum';
import { ethereumDev } from './contexts/ethereum-dev';
import { polygon } from './contexts/polygon';
import { testnet } from './contexts/testnet';

export interface Variables {
  block: number;
  wethTokenAddress: string;
  wrappedNativeTokenAddress: string;
  chainlinkAggregatorAddresses: {
    audUsd: string;
    btcEth: string;
    btcusd: string;
    chfusd: string;
    ethUsd: string;
    eurUsd: string;
    gbpUsd: string;
    jpyUsd: string;
  };
  persistent: {
    addressListRegistryAddress: string;
    dispatcherAddress: string;
    externalPositionFactoryAddress: string;
    gatedRedemptionQueueSharesWrapperFactoryAddress: string;
    manualValueOracleFactoryAddress: string;
    pendleMarketsRegistryAddress: string;
    protocolFeeReserveLibAddress: string;
    sharesSplitterFactoryAddress: string;
    singleAssetRedemptionQueueFactoryAddress: string;
    singleAssetDepositQueueFactoryAddress: string;
    uintListRegistryAddress: string;
  };
  releases: {
    v2: v2.ReleaseVariables;
    v3: v3.ReleaseVariables;
    v4: v4.ReleaseVariables;
  };
  external: {
    balancerMinterAddress: string;
    curveMinterAddress: string;
    cvxLockerV2Address: string;
    theGraphStakingProxyAddress: string;
    cvxAddress: string;
    mplAddress: string;
    grtAddress: string;
    lusdAddress: string;
    compAddress: string;
    // morphoBlueAddress: string;
    aliceOrderManager: string;
    stethAddress: string;
    ethxAddress: string;
  };
}

export const contexts: Contexts<Variables> = {
  arbitrum,
  base,
  ethereum,
  'ethereum-dev': ethereumDev,
  polygon,
  testnet,
};

export const templates: Template[] = [
  {
    template: 'templates/addresses.ts',
    destination: 'generated/addresses.ts',
  },
];

export const configure: Configurator<Variables> = (variables) => {
  const sdks: SdkUserDeclaration[] = [
    {
      name: 'Protocol',
      abis: {
        ChainlinkAggregator: 'abis/external/ChainlinkAggregator.json',
        Dispatcher: 'abis/Dispatcher.json',
        ValueInterpreterA: 'abis/v2/ValueInterpreter.json',
        ValueInterpreterB: 'abis/v4/ValueInterpreter.json',
        VaultLib: 'abis/v4/VaultLib.json',
        ComptrollerLibA: 'abis/v2/ComptrollerLib.json',
        ComptrollerLibB: 'abis/v4/ComptrollerLib.json',
        CompoundDebtPositionLib: 'abis/v4/CompoundDebtPositionLib.json',
        AaveDebtPositionLib: 'abis/v4/AaveDebtPositionLib.json',
        LiquityDebtPositionLib: 'abis/v4/LiquityDebtPositionLib.json',
        GasRelayPaymasterLib: 'abis/v4/GasRelayPaymasterLib.json',
        ProtocolFeeTracker: 'abis/v4/ProtocolFeeTracker.json',
        OnlyUntrackDustOrPricelessAssetsPolicy: 'abis/v4/OnlyUntrackDustOrPricelessAssetsPolicy.json',
        IExternalPositionProxy: 'abis/v4/IExternalPositionProxy.json',
        UniswapV3LiquidityPositionLib: 'abis/v4/UniswapV3LiquidityPositionLib.json',
        IStakingWrapper: 'abis/v4/IStakingWrapper.json',
      },
      functions: (abis) => [
        abis.ChainlinkAggregator.getFunction('latestAnswer'),
        abis.ChainlinkAggregator.getFunction('latestTimestamp'),
        abis.Dispatcher.getFunction('getMigrationTimelock'),
        abis.Dispatcher.getFunction('getSharesTokenSymbol'),
        abis.Dispatcher.getFunction('getOwner'),
        abis.Dispatcher.getFunction('getNominatedOwner'),
        abis.ValueInterpreterA.getFunction('calcCanonicalAssetValue'),
        abis.ValueInterpreterB.getFunction('calcCanonicalAssetValue'),
        abis.VaultLib.getFunction('name'),
        abis.VaultLib.getFunction('getProtocolFeeTracker'),
        abis.VaultLib.getFunction('balanceOf'),
        abis.VaultLib.getFunction('totalSupply'),
        abis.ComptrollerLibA.getFunction('calcGav'),
        abis.ComptrollerLibB.getFunction('calcGav'),
        abis.ComptrollerLibA.getFunction('calcGrossShareValue'),
        abis.ComptrollerLibB.getFunction('calcGrossShareValue'),
        abis.ComptrollerLibA.getFunction('getDenominationAsset'),
        abis.ComptrollerLibA.getFunction('getVaultProxy'),
        abis.CompoundDebtPositionLib.getFunction('getManagedAssets'),
        abis.CompoundDebtPositionLib.getFunction('getDebtAssets'),
        abis.AaveDebtPositionLib.getFunction('getManagedAssets'),
        abis.AaveDebtPositionLib.getFunction('getDebtAssets'),
        abis.LiquityDebtPositionLib.getFunction('getDebtAssets'),
        abis.LiquityDebtPositionLib.getFunction('getManagedAssets'),
        abis.GasRelayPaymasterLib.getFunction('getParentComptroller'),
        abis.GasRelayPaymasterLib.getFunction('getRelayHubDeposit'),
        abis.ProtocolFeeTracker.getFunction('getFeeBpsForVault'),
        abis.OnlyUntrackDustOrPricelessAssetsPolicy.getFunction('getFundDeployer'),
        abis.IExternalPositionProxy.getFunction('getExternalPositionType'),
        abis.UniswapV3LiquidityPositionLib.getFunction('getNonFungibleTokenManager'),
        abis.IStakingWrapper.getFunction('getRewardTokens'),
      ],
    },

    {
      name: 'ERC20',
      abis: {
        ERC20: 'abis/erc20/ERC20.json',
      },
      functions: (abis) => [
        abis.ERC20.getFunction('totalSupply'),
        abis.ERC20.getFunction('allowance'),
        abis.ERC20.getFunction('balanceOf'),
        abis.ERC20.getFunction('decimals'),
        abis.ERC20.getFunction('symbol'),
        abis.ERC20.getFunction('name'),
      ],
    },
    {
      name: 'ERC20Bytes',
      abis: {
        ERC20Bytes: 'abis/erc20/ERC20Bytes.json',
      },
      functions: (abis) => [abis.ERC20Bytes.getFunction('symbol'), abis.ERC20Bytes.getFunction('name')],
    },
    {
      name: 'External',
      abis: {
        AliceOrderManager: 'abis/external/IAliceOrderManager.json',
        BalancerMinter: 'abis/external/BalancerMinter.json',
        CurveLiquidityGaugeV2: 'abis/external/CurveLiquidityGaugeV2.json',
        CurveMinter: 'abis/external/CurveMinter.json',
        CvxLockerV2: 'abis/external/CvxLockerV2.json',
        IAaveAToken: 'abis/external/IAaveAToken.json',
        IMapleV2Pool: 'abis/external/IMapleV2Pool.json',
        IMapleV2PoolManager: 'abis/external/IMapleV2PoolManager.json',
        IMapleV2WithdrawalManager: 'abis/external/IMapleV2WithdrawalManager.json',
        IPendleV2Market: 'abis/external/IPendleV2Market.json',
        MaplePool: 'abis/external/MaplePool.json',
        MapleRewards: 'abis/external/MapleRewards.json',
        // MorphoBlue: 'abis/external/MorphoBlue.json',
        NonfungiblePositionManager: 'abis/external/NonfungiblePositionManager.json',
        TheGraphStaking: 'abis/external/TheGraphStaking.json',
        UniswapV3Factory: 'abis/external/UniswapV3Factory.json',
        UniswapV3Pool: 'abis/external/UniswapV3Pool.json',
        StakeWiseV3EthVault: 'abis/external/StakeWiseV3EthVault.json',
      },
      functions: (abis) => [
        abis.AliceOrderManager.getFunction('getInstrument'),
        abis.BalancerMinter.getFunction('getBalancerToken'),
        abis.CurveLiquidityGaugeV2.getFunction('reward_tokens'),
        abis.CurveMinter.getFunction('token'),
        abis.CvxLockerV2.getFunction('userLocks'),
        abis.IAaveAToken.getFunction('UNDERLYING_ASSET_ADDRESS'),
        abis.IMapleV2Pool.getFunction('totalAssets'),
        abis.IMapleV2Pool.getFunction('manager'),
        abis.IMapleV2Pool.getFunction('unrealizedLosses'),
        abis.IMapleV2Pool.getFunction('totalSupply'),
        abis.IMapleV2Pool.getFunction('convertToExitAssets'),
        abis.IMapleV2Pool.getFunction('asset'),
        abis.IMapleV2PoolManager.getFunction('withdrawalManager'),
        abis.IMapleV2WithdrawalManager.getFunction('lockedShares'),
        abis.IPendleV2Market.getFunction('readTokens'),
        abis.IPendleV2Market.getFunction('getRewardTokens'),
        abis.MaplePool.getFunction('liquidityAsset'),
        abis.MapleRewards.getFunction('stakingToken'),
        // abis.MorphoBlue.getFunction('idToMarketParams'),
        abis.NonfungiblePositionManager.getFunction('factory'),
        abis.NonfungiblePositionManager.getFunction('positions'),
        abis.NonfungiblePositionManager.getFunction('tokenURI'),
        abis.TheGraphStaking.getFunction('getDelegation'),
        abis.TheGraphStaking.getFunction('delegationPools'),
        abis.TheGraphStaking.getFunction('delegationTaxPercentage'),
        abis.UniswapV3Factory.getFunction('getPool'),
        abis.UniswapV3Pool.getFunction('slot0'),
        abis.UniswapV3Pool.getFunction('liquidity'),
        abis.StakeWiseV3EthVault.getFunction('convertToShares'),
        abis.StakeWiseV3EthVault.getFunction('convertToAssets'),
      ],
    },
  ];

  const sources: DataSourceUserDeclaration[] = [
    ...persistent.sources(variables),
    ...v2.sources(variables.releases.v2).map((item) => ({ ...item, version: 2, block: variables.block })),
    ...v3.sources(variables.releases.v3).map((item) => ({ ...item, version: 3, block: variables.block })),
    ...v4.sources(variables.releases.v4).map((item) => ({ ...item, version: 4, block: variables.block })),
  ];

  const templates: DataSourceTemplateUserDeclaration[] = [
    ...persistent.templates,
    ...v2.templates.map((item) => ({ ...item, version: 2 })),
    ...v3.templates.map((item) => ({ ...item, version: 3 })),
    ...v4.templates.map((item) => ({ ...item, version: 4 })),
  ];

  return {
    sdks,
    templates,
    sources: [...sources],
  };
};
