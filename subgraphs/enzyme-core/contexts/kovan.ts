import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';

export const kovanContext: Context<Variables> = {
  name: 'enzymefinance/enzyme-core-kovan',
  network: 'kovan',
  variables: {
    block: 24710049,
    dispatcherAddress: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
    releaseA: {
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

      // Derivative Price Feeds
      aavePriceFeedAddress: '0x0000000000000000000000000000000000000000',
      alphaHomoraV1PriceFeedAddress: '0x0000000000000000000000000000000000000000',
      chaiPriceFeedAddress: '0x0000000000000000000000000000000000000000',
      compoundPriceFeedAddress: '0xd54CD71FD75A23FA8e4df44E4176e17Eb6f2B36D',
      curvePriceFeedAddress: '0x0000000000000000000000000000000000000000',
      idlePriceFeedAddress: '0x0000000000000000000000000000000000000000',
      lidoStethPriceFeedAddress: '0x0000000000000000000000000000000000000000',
      stakehoundEthPriceFeedAddress: '0x0000000000000000000000000000000000000000',
      synthetixPriceFeedAddress: '0x4BA8f54EC8f11e69e95933Cc894cC726567072C0',
      uniswapV2PoolPriceFeedAddress: '0xA311e4F6719e3eD91ce3f7f20294009AcF0BF0D3',
      wdgldPriceFeedAddress: '0x0000000000000000000000000000000000000000',

      // Peripheral
      fundActionsWrapperAddress: '0x7954a509058CB9a4F3169Df64D5332793092219E',
      authUserExecutedSharesRequestorFactoryAddress: '0x763AAAAA45A9761fD21ab0cA71c76b5e075Bc064',

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

      // Adapters
      aaveAdapterAddress: '0x0000000000000000000000000000000000000000',
      alphaHomoraV1AdapterAddress: '0x0000000000000000000000000000000000000000',
      chaiAdapterAddress: '0x0000000000000000000000000000000000000000',
      compoundAdapterAddress: '0xe759441dA6BCfba3a389384638d415eE80B2883B',
      curveExchangeAdapterAddress: '0x0000000000000000000000000000000000000000',
      curveLiquidityAaveAdapterAddress: '0x0000000000000000000000000000000000000000',
      curveLiquiditySethAdapterAddress: '0x0000000000000000000000000000000000000000',
      curveLiquidityStethAdapterAddress: '0x0000000000000000000000000000000000000000',
      idleAdapterAddress: '0x0000000000000000000000000000000000000000',
      kyberAdapterAddress: '0x367C5084781bFebe3aE56d2387b70187F154BCd5',
      paraSwapAdapterAddress: '0x0000000000000000000000000000000000000000',
      paraSwapV4AdapterAddress: '0x0000000000000000000000000000000000000000',
      synthetixAdapterAddress: '0x810809f334A3bf96437adC7540C0D74bdA653aD8',
      trackedAssetsAdapterAddress: '0x311c8CfBFF5fBC79b0F3926B1C52A37dcd0257Af',
      uniswapV2AdapterAddress: '0x3d3887758023a6a1DCAF999E5429055Fb43CAfaE',
      zeroExV2AdapterAddress: '0x1dEbC247ecCB10dA06D42D6590E6FE19bc9a87FA',
    },
    releaseB: {
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

      // Derivative Price Feeds
      aavePriceFeedAddress: '0x0000000000000000000000000000000000000000',
      alphaHomoraV1PriceFeedAddress: '0x0000000000000000000000000000000000000000',
      chaiPriceFeedAddress: '0x0000000000000000000000000000000000000000',
      compoundPriceFeedAddress: '0x1a093b133B0f7E791b0F36eC5b5C50628f02d74F',
      curvePriceFeedAddress: '0x0000000000000000000000000000000000000000',
      idlePriceFeedAddress: '0x0000000000000000000000000000000000000000',
      lidoStethPriceFeedAddress: '0x0000000000000000000000000000000000000000',
      stakehoundEthPriceFeedAddress: '0x0000000000000000000000000000000000000000',
      synthetixPriceFeedAddress: '0x720056BF7476463428Ab0db0C75e49b83102B3be',
      uniswapV2PoolPriceFeedAddress: '0xBC73c581BA1d2AA83e6575e85f2C2aE6284fA60F',
      wdgldPriceFeedAddress: '0x0000000000000000000000000000000000000000',

      // Peripheral
      fundActionsWrapperAddress: '0x6F00910dB9009c950c5a7c75AE10Aa529b18308A',
      authUserExecutedSharesRequestorFactoryAddress: '0x829f1954a7682aCCad8c0869a3eF04125d93A12f',

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

      // Adapters
      aaveAdapterAddress: '0x0000000000000000000000000000000000000000',
      alphaHomoraV1AdapterAddress: '0x0000000000000000000000000000000000000000',
      chaiAdapterAddress: '0x0000000000000000000000000000000000000000',
      compoundAdapterAddress: '0xbfdcfD59Bb50d61CcB2a8dC068fA6d1c5071a3e8',
      curveExchangeAdapterAddress: '0x0000000000000000000000000000000000000000',
      curveLiquidityAaveAdapterAddress: '0x0000000000000000000000000000000000000000',
      curveLiquiditySethAdapterAddress: '0x0000000000000000000000000000000000000000',
      curveLiquidityStethAdapterAddress: '0x0000000000000000000000000000000000000000',
      idleAdapterAddress: '0x0000000000000000000000000000000000000000',
      kyberAdapterAddress: '0xd0dc89F8bff640DC399D9d56f451d7be182f792B',
      paraSwapAdapterAddress: '0x0000000000000000000000000000000000000000',
      paraSwapV4AdapterAddress: '0x0000000000000000000000000000000000000000',
      synthetixAdapterAddress: '0xD9ba34570313887275Bf6d4e6e033F1b138fb97f',
      trackedAssetsAdapterAddress: '0x837d050F4a9eed50E32dAc9571Cf22F064514891',
      uniswapV2AdapterAddress: '0x667807bbC182D61bA6C0989dA4A8Da65f0320C7D',
      zeroExV2AdapterAddress: '0x780e7B642BB60d1037a6ca373CfF0aEA5269Dfa9',
    },
  },
};
