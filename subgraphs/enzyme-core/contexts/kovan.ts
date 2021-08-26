import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';

export const kovanContext: Context<Variables> = {
  name: 'enzymefinance/enzyme-core-kovan',
  network: 'kovan',
  variables: {
    block: 24710049,
    dispatcherAddress: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
    wethTokenAddress: '0x0000000000000000000000000000000000000000',
    release2: {
      fundDeployerAddress: '0xC5bADFDa459c329d20AA155a95dC43BA04c71228',
      vaultLibAddress: '0xe5cf8b7dd03e2cb3A9A5b1237bb8e99DbaC29704',
      comptrollerLibAddress: '0x55dbd3b92CEC623Ea5B37BBb9ED5Ec086887AA1A',
      valueInterpreterAddress: '0xFEE7aEE3907d1657fd2BdcBba8909AF40a144421',
      integrationManagerAddress: '0x284d07Ea5EEf265592cfF84657903c9Da2aCeA16',
      policyManagerAddress: '0xdc2f2d25568604F63f4Af5dC4988895d1A1e29BA',
      feeManagerAddress: '0x9D4705Dc3d24F988f5dd2C306F7a7E7524c7aCBB',

      // Prices
      aggregatedDerivativePriceFeedAddress: '0x1899F9e144A0D47cC1471e797C2b7930adf530b3',
      chainlinkPriceFeedAddress: '0x1dbf40Fc502A61a09c38F5D0f4D07f42AC507606',

      // Fees
      managementFeeAddress: '0xda3400c7aBA11e683f4eb9b8f94B202C49fBdFaa',
      performanceFeeAddress: '0x9b9CF0ECdb2c4ad9cd03382323d3C85E5a180163',
      entranceRateBurnFeeAddress: '0xb56c9a58c907a48CcD700136a4fa39F1c6E3dbf2',
      entranceRateDirectFeeAddress: '0x44f7E598A75855230e8B55855e370Fb6e6Fa2dc7',

      // Policies
      adapterBlacklistAddress: '0x762c8CEb54A7bED77e7aAB084928Bbff39438300',
      adapterWhitelistAddress: '0x3AEF77bc169a957033Fe6b385ea8964A183f5Dc3',
      assetBlacklistAddress: '0x53268f29C166F6420F68aEc58b5046d6b95dc136',
      assetWhitelistAddress: '0x7683F8DcC80Ce520c8A0395fDBf30E083dcA7EDC',
      investorWhitelistAddress: '0x7AA9de0e4Dc5f5990B0487ff494e5C640CAE9F4A',
      guaranteedRedemptionAddress: '0x108F9370443626018C053CCA6d447e946C0aE33C',
      maxConcentrationAddress: '0xDF7A8AB72246bA6ea551bfFd7259dBD7ff4C6848',
      minMaxInvestmentAddress: '0x18b292A0A9E1092572d73D105e621f93f2b7f484',
      buySharesCallerWhitelistAddress: '0x2a0e8e532440a477d0C1520F674356eAbd9fB5Cc',
    },
    release3: {
      fundDeployerAddress: '0x8375F0423C1DE0D8aCDCa79224F3d47fE8E6E197',
      vaultLibAddress: '0x7264721E8108e20c23592AaeCf923f1B84ce0A6a',
      comptrollerLibAddress: '0x9e8C31Df3d54Bbd1a9962BD8A3d69543e6b4fEAd',
      valueInterpreterAddress: '0x92D1D329de7633B788bD4A9727192C2F498e2cA7',
      integrationManagerAddress: '0x81198c4b6954CbA32d7aCE52580bd7a1265DEa3f',
      policyManagerAddress: '0x49FA9A194D0fC7bbD8f350AF2206975EDB7E2c3b',
      feeManagerAddress: '0x918E921b22BC1607D5638ba1E183AeC121B60147',

      // Prices
      aggregatedDerivativePriceFeedAddress: '0x5304c3f2c2433e5e37732B46604eEB39725a4883',
      chainlinkPriceFeedAddress: '0x5A49D2a6420362bE3E396C59Fe9280c9f9588Ec3',

      // Fees
      managementFeeAddress: '0x7E8E91FCf0Ad73e20AdEe711Eb9E21FE65B90E60',
      performanceFeeAddress: '0xef1fc84A85CCfC11B79cb82f78C0Dd8135569073',
      entranceRateBurnFeeAddress: '0x15EDfbE8721F2535cC8AAf48DECA0D8f7F1aecC5',
      entranceRateDirectFeeAddress: '0xC5067806fF8896740d7e4832b74D0485cdead6DC',

      // Policies
      adapterBlacklistAddress: '0x5a41d51A4000Cd2Fb7Fe73344439e475476733EC',
      adapterWhitelistAddress: '0x3fd5b5d1C821c586ACfFf4BC665EC3F68185848b',
      assetBlacklistAddress: '0x66E495b987C2130C08792831B1B56b8CBafBf703',
      assetWhitelistAddress: '0xA08d6b67080A9EECFdD4638D418A65b3B8Add31F',
      investorWhitelistAddress: '0x9A300Ab621B41B7b8dC16775Ca1FDc9AB569C1B8',
      guaranteedRedemptionAddress: '0x1ad523EF0bF08eF5C7640378C6cbD1eD58684D49',
      maxConcentrationAddress: '0xe640A756184FCDeFBE3228a2297dEb8cAF19AA61',
      minMaxInvestmentAddress: '0x367775E982408BC9326abAC10DF7D30480Cc02E1',
      buySharesCallerWhitelistAddress: '0x5EDDDCD4737AE331A730Ab25b764Dc3B9D3882fe',
    },
    release4: {
      fundDeployerAddress: '0x0000000000000000000000000000000000000000',
      vaultLibAddress: '0x0000000000000000000000000000000000000000',
      comptrollerLibAddress: '0x0000000000000000000000000000000000000000',
      valueInterpreterAddress: '0x0000000000000000000000000000000000000000',
      integrationManagerAddress: '0x0000000000000000000000000000000000000000',
      policyManagerAddress: '0x0000000000000000000000000000000000000000',
      feeManagerAddress: '0x0000000000000000000000000000000000000000',
      globalConfigLibAddress: '0x0000000000000000000000000000000000000000',

      // External Positions
      externalPositionFactoryAddress: '0x0000000000000000000000000000000000000000',
      externalPositionManagerAddress: '0x0000000000000000000000000000000000000000',

      // Gas Relayer
      gasRelayPaymasterFactoryAddress: '0x0000000000000000000000000000000000000000',

      // Protocol Feed
      protocolFeeReserveLibAddress: '0x0000000000000000000000000000000000000000',
      protocolFeeTrackerAddress: '0x0000000000000000000000000000000000000000',

      // Fees
      managementFeeAddress: '0x0000000000000000000000000000000000000000',
      performanceFeeAddress: '0x0000000000000000000000000000000000000000',
      entranceRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
      entranceRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',
      exitRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
      exitRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',

      // Policies
      allowedAdapterIncomingAssetsPolicyAddress: '0x0000000000000000000000000000000000000000',
      allowedDepositRecipientsPolicyAddress: '0x0000000000000000000000000000000000000000',
      guaranteedRedemptionPolicyAddress: '0x0000000000000000000000000000000000000000',
      minMaxInvestmentPolicyAddress: '0x0000000000000000000000000000000000000000',
    },
  },
};
