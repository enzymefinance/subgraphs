import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { Deployment, Version } from '@enzymefinance/environment';

export const arbitrum: Context<Variables> = {
  name: 'enzyme-core-arbitrum',
  network: 'arbitrum-one',
  variables: {
    block: 230330283,
    wethTokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    wrappedNativeTokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    chainlinkAggregatorAddresses: {
      audUsd: '0x9854e9a850e7c354c1de177ea953a6b1fba8fc22',
      btcEth: '0xc5a90a6d7e4af242da238ffe279e9f2ba0c64b2e',
      btcusd: '0x6ce185860a4963106506c203335a2910413708e9',
      chfusd: '0xe32accc8c4ec03f6e75bd3621bfc9fbb234e1fc3',
      ethUsd: '0x639fe6ab55c921f74e7fac1ee960c0b6293ba612',
      eurUsd: '0xa14d53bc1f1c0f31b4aa3bd109344e5009051a84',
      gbpUsd: '0x9c4424fd84c6661f97d8d6b3fc3c1aac2bedd137',
      jpyUsd: '0x3dd6e51cb9cae717d5a8778cf79a04029f9cfdf8',
    },
    external: {
      balancerMinterAddress: '0x0000000000000000000000000000000000000000',
      curveMinterAddress: '0x0000000000000000000000000000000000000000',
      cvxLockerV2Address: '0x0000000000000000000000000000000000000000',
      cvxAddress: '0x0000000000000000000000000000000000000000',
      mplAddress: '0x0000000000000000000000000000000000000000',
      grtAddress: '0x9623063377ad1b27544c965ccd7342f7ea7e88c7',
      theGraphStakingProxyAddress: '0x0000000000000000000000000000000000000000',
      lusdAddress: '0x0000000000000000000000000000000000000000',
      compAddress: '0x354a6da3fcde098f8389cad84b0182725c6c91de',
      // morphoBlueAddress: "0x0000000000000000000000000000000000000000",
    },
    persistent: {
      addressListRegistryAddress: '0x2c6bef68dabf0494bb5f727e63c8fb54f7d2c287',
      dispatcherAddress: '0x8da28441a4c594fd2fac72726c1412d8cf9e4a19',
      externalPositionFactoryAddress: '0xd44256acea2193d4a50a9ad879a531666729962c',
      gatedRedemptionQueueSharesWrapperFactoryAddress: '0x0000000000000000000000000000000000000000',
      pendleMarketsRegistryAddress: '0x0000000000000000000000000000000000000000',
      protocolFeeReserveLibAddress: '0x642986a6bc5ec518cfb97d8afa5a7fa8477d3cf5',
      sharesSplitterFactoryAddress: '0x0000000000000000000000000000000000000000',
      singleAssetRedemptionQueueFactoryAddress: '0x0000000000000000000000000000000000000000',
      uintListRegistryAddress: '0xc438e48f5d2f99eb4a2b9865f8cccfc9915f227a',
    },
    releases: {
      v2: {
        adapterBlacklistAddress: '0x0000000000000000000000000000000000000000',
        adapterWhitelistAddress: '0x0000000000000000000000000000000000000000',
        aggregatedDerivativePriceFeedAddress: '0x0000000000000000000000000000000000000000',
        assetBlacklistAddress: '0x0000000000000000000000000000000000000000',
        assetWhitelistAddress: '0x0000000000000000000000000000000000000000',
        buySharesCallerWhitelistAddress: '0x0000000000000000000000000000000000000000',
        chainlinkPriceFeedAddress: '0x0000000000000000000000000000000000000000',
        comptrollerLibAddress: '0x0000000000000000000000000000000000000000',
        entranceRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
        entranceRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',
        feeManagerAddress: '0x0000000000000000000000000000000000000000',
        fundActionsWrapperAddress: '0x0000000000000000000000000000000000000000',
        fundDeployerAddress: '0x0000000000000000000000000000000000000000',
        guaranteedRedemptionAddress: '0x0000000000000000000000000000000000000000',
        integrationManagerAddress: '0x0000000000000000000000000000000000000000',
        investorWhitelistAddress: '0x0000000000000000000000000000000000000000',
        managementFeeAddress: '0x0000000000000000000000000000000000000000',
        maxConcentrationAddress: '0x0000000000000000000000000000000000000000',
        minMaxInvestmentAddress: '0x0000000000000000000000000000000000000000',
        performanceFeeAddress: '0x0000000000000000000000000000000000000000',
        policyManagerAddress: '0x0000000000000000000000000000000000000000',
        valueInterpreterAddress: '0x0000000000000000000000000000000000000000',
        vaultLibAddress: '0x0000000000000000000000000000000000000000',
      },
      v3: {
        adapterBlacklistAddress: '0x0000000000000000000000000000000000000000',
        adapterWhitelistAddress: '0x0000000000000000000000000000000000000000',
        aggregatedDerivativePriceFeedAddress: '0x0000000000000000000000000000000000000000',
        assetBlacklistAddress: '0x0000000000000000000000000000000000000000',
        assetWhitelistAddress: '0x0000000000000000000000000000000000000000',
        buySharesCallerWhitelistAddress: '0x0000000000000000000000000000000000000000',
        chainlinkPriceFeedAddress: '0x0000000000000000000000000000000000000000',
        comptrollerLibAddress: '0x0000000000000000000000000000000000000000',
        entranceRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
        entranceRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',
        feeManagerAddress: '0x0000000000000000000000000000000000000000',
        fundActionsWrapperAddress: '0x0000000000000000000000000000000000000000',
        fundDeployerAddress: '0x0000000000000000000000000000000000000000',
        guaranteedRedemptionAddress: '0x0000000000000000000000000000000000000000',
        integrationManagerAddress: '0x0000000000000000000000000000000000000000',
        investorWhitelistAddress: '0x0000000000000000000000000000000000000000',
        managementFeeAddress: '0x0000000000000000000000000000000000000000',
        maxConcentrationAddress: '0x0000000000000000000000000000000000000000',
        minMaxInvestmentAddress: '0x0000000000000000000000000000000000000000',
        performanceFeeAddress: '0x0000000000000000000000000000000000000000',
        policyManagerAddress: '0x0000000000000000000000000000000000000000',
        valueInterpreterAddress: '0x0000000000000000000000000000000000000000',
        vaultLibAddress: '0x0000000000000000000000000000000000000000',
      },
      v4: {
        allowedAdapterIncomingAssetsPolicyAddress: '0x54325c3dc5ad60305a70bc565be7a9ce71224a76',
        allowedAdaptersPerManagerPolicyAddress: '0xeb036c294e54cc5047ab526c204752d056cc1952',
        allowedAdaptersPolicyAddress: '0x1768b813d17f82a8d70bd8b80a8c8c1562878337',
        allowedAssetsForRedemptionPolicyAddress: '0x166ada85f6a398ba01d2b97022770cc6bd9d2ea2',
        allowedDepositRecipientsPolicyAddress: '0xde0c43b8cb1cacdec773ef55fcbfbcbe009891f1',
        allowedExternalPositionTypesPerManagerPolicyAddress: '0x38673bace2ae5e90d4936d0d90b58a3577795205',
        allowedExternalPositionTypesPolicyAddress: '0x3c441b696bd451d0ba95ebb73cf1b23c20873e14',
        allowedRedeemersForSpecificAssetsPolicyAddress: '0x19abba4ab3134c64abdd17a9073d1ec83663f036',
        allowedSharesTransferRecipientsPolicyAddress: '0xb5ef1f5e549ad46603bec9011b99a96a6cfd993e',
        arbitraryLoanFixedInterestModuleAddress: '0x0000000000000000000000000000000000000000',
        arbitraryLoanTotalNominalDeltaOracleModuleAddress: '0x0000000000000000000000000000000000000000',
        auraBalancerV2LpStakingAdapterAddress: '0x0000000000000000000000000000000000000000',
        balancerV2LiquidityAdapterAddress: '0xb3ea1f2f3d2cdbd81a3de91fdf9a2f3e3acd66c1',
        compoundV3AdapterAddress: '0x0000000000000000000000000000000000000000',
        comptrollerLibAddress: '0x3868c0fc34b6ece124c6ab122f6f29e978be6661',
        convexCurveLpStakingAdapterAddress: '0x0000000000000000000000000000000000000000',
        convexCurveLpStakingWrapperFactoryAddress: '0x0000000000000000000000000000000000000000',
        cumulativeSlippageTolerancePolicyAddress: '0x487f6a8a93c2be5a296ead2c3fbc3fceed4ac599',
        curveLiquidityAdapterAddress: '0x0000000000000000000000000000000000000000',
        disallowedAdapterIncomingAssetsPolicyAddress: '0x5c9348fbedb75c39f0e84396618accab6c01f847',
        entranceRateBurnFeeAddress: '0x6180b98d85afbd904016c7ea08eb41cba77a1c08',
        entranceRateDirectFeeAddress: '0xbd35b273453eb3a977f2757f92b20e8c0b33c0b2',
        exitRateBurnFeeAddress: '0x8bdb929f16c2ce833c3c3176ba5c607e20949010',
        exitRateDirectFeeAddress: '0x769c732a17f6e72d7ba0fe79ad01a31b27bbcb3d',
        externalPositionManagerAddress: '0x90b53aefdbd2ba3573d965d2d98951f2aa00507d',
        feeManagerAddress: '0x2c46503d4a0313c7161a5593b6865baa194b466f',
        fundDeployerAddress: '0xa2b4c827de13d4e9801ea1ca837524a1a148dec3',
        gasRelayPaymasterFactoryAddress: '0xe922362aa3426bd683b63a8e5d13903a9cfc4cbb',
        integrationManagerAddress: '0x55df97aca98c2a708721f28ea1ca42a2be7ff934',
        managementFeeAddress: '0xd2fa8f6706241dfdf8069d05e1d6f6c4a439aa86',
        minAssetBalancesPostRedemptionPolicyAddress: '0x53a124c9201f0d00470cd4245946d2bbb98210ba',
        minMaxInvestmentPolicyAddress: '0x542812a43334634213877fbfde33ecbef5234c9d',
        minSharesSupplyFeeAddress: '0xa8c3b04a800c08ae010b56ac1c1ad7033d980b0f',
        noDepegOnRedeemSharesForSpecificAssetsPolicyAddress: '0xad404ceabad39d4b22bf2e1265a161ac44620825',
        onlyRemoveDustExternalPositionPolicyAddress: '0xe4453105be9e579896a3ed73df9a1e285c8c95c2',
        onlyUntrackDustOrPricelessAssetsPolicyAddress: '0xa482f4ab637cd5ca00084d511b3ca9aa8d8f475e',
        performanceFeeAddress: '0x9e0f80bc5a688e93d6c57efcfdd4564f70975e8b',
        policyManagerAddress: '0xbde1e8c4a061cd28f4871860ddf22200b85ee9ec',
        protocolFeeTrackerAddress: '0xe71227d6d846e0fb3367d020683327031c4c4a3d',
        unpermissionedActionsWrapperAddress: '0x6aab72ede0255f3dd0e1ce568248a63aa3df2320',
        valueInterpreterAddress: '0xdd5f18a52a63ececf502a165a459d33be5c0a06c',
        vaultLibAddress: '0xe1a147b3fb8a7be78bf3a061f176bc718d897695',
      },
    },
  },
};
