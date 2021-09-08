import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';

export const kovanContext: Context<Variables> = {
  name: 'enzymefinance/enzyme-core-kovan',
  network: 'kovan',
  variables: {
    block: 27096029,
    dispatcherAddress: '0x5235b80d1b770f05957344556ecc507683bA40fD',
    wethTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    chainlinkAggregatorAddresses: {
      audUsd: '0x5813A90f826e16dB392abd2aF7966313fc1fd5B8',
      btcEth: '0xF7904a295A029a3aBDFFB6F12755974a958C7C25',
      btcusd: '0x6135b13325bfC4B00278B4abC5e20bbce2D6580e',
      chfusd: '0xed0616BeF04D374969f302a34AE4A63882490A8C',
      ethUsd: '0x9326BFA02ADD2366b30bacB125260Af641031331',
      eurUsd: '0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13',
      gbpUsd: '0x28b0061f44E6A9780224AA61BEc8C3Fcb0d37de9',
      jpyUsd: '0xD627B1eF3AC23F1d3e576FA6206126F3c1Bd0942',
    },
    release2: {
      fundDeployerAddress: '0x0000000000000000000000000000000000000000',
      vaultLibAddress: '0x0000000000000000000000000000000000000000',
      comptrollerLibAddress: '0x0000000000000000000000000000000000000000',
      valueInterpreterAddress: '0x0000000000000000000000000000000000000000',
      integrationManagerAddress: '0x0000000000000000000000000000000000000000',
      policyManagerAddress: '0x0000000000000000000000000000000000000000',
      feeManagerAddress: '0x0000000000000000000000000000000000000000',

      // Prices
      aggregatedDerivativePriceFeedAddress: '0x0000000000000000000000000000000000000000',
      chainlinkPriceFeedAddress: '0x0000000000000000000000000000000000000000',

      // Fees
      managementFeeAddress: '0x0000000000000000000000000000000000000000',
      performanceFeeAddress: '0x0000000000000000000000000000000000000000',
      entranceRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
      entranceRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',

      // Policies
      adapterBlacklistAddress: '0x0000000000000000000000000000000000000000',
      adapterWhitelistAddress: '0x0000000000000000000000000000000000000000',
      assetBlacklistAddress: '0x0000000000000000000000000000000000000000',
      assetWhitelistAddress: '0x0000000000000000000000000000000000000000',
      investorWhitelistAddress: '0x0000000000000000000000000000000000000000',
      guaranteedRedemptionAddress: '0x0000000000000000000000000000000000000000',
      maxConcentrationAddress: '0x0000000000000000000000000000000000000000',
      minMaxInvestmentAddress: '0x0000000000000000000000000000000000000000',
      buySharesCallerWhitelistAddress: '0x0000000000000000000000000000000000000000',
    },
    release3: {
      fundDeployerAddress: '0x0000000000000000000000000000000000000000',
      vaultLibAddress: '0x0000000000000000000000000000000000000000',
      comptrollerLibAddress: '0x0000000000000000000000000000000000000000',
      valueInterpreterAddress: '0x0000000000000000000000000000000000000000',
      integrationManagerAddress: '0x0000000000000000000000000000000000000000',
      policyManagerAddress: '0x0000000000000000000000000000000000000000',
      feeManagerAddress: '0x0000000000000000000000000000000000000000',

      // Prices
      aggregatedDerivativePriceFeedAddress: '0x0000000000000000000000000000000000000000',
      chainlinkPriceFeedAddress: '0x0000000000000000000000000000000000000000',

      // Fees
      managementFeeAddress: '0x0000000000000000000000000000000000000000',
      performanceFeeAddress: '0x0000000000000000000000000000000000000000',
      entranceRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
      entranceRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',

      // Policies
      adapterBlacklistAddress: '0x0000000000000000000000000000000000000000',
      adapterWhitelistAddress: '0x0000000000000000000000000000000000000000',
      assetBlacklistAddress: '0x0000000000000000000000000000000000000000',
      assetWhitelistAddress: '0x0000000000000000000000000000000000000000',
      investorWhitelistAddress: '0x0000000000000000000000000000000000000000',
      guaranteedRedemptionAddress: '0x0000000000000000000000000000000000000000',
      maxConcentrationAddress: '0x0000000000000000000000000000000000000000',
      minMaxInvestmentAddress: '0x0000000000000000000000000000000000000000',
      buySharesCallerWhitelistAddress: '0x0000000000000000000000000000000000000000',
    },
    release4: {
      allowedAdapterIncomingAssetsPolicyAddress: '0x9b6a657617B458E32F9D55B1399ba960E724129e',
      allowedDepositRecipientsPolicyAddress: '0x9a270d80E064B5CE9dB406B6B84bB7AB40A29A3a',
      comptrollerLibAddress: '0x6460348F4f636276577e3b6CC753E0B679a8065e',
      entranceRateBurnFeeAddress: '0x07B0b3835e2348f240Cc9B98055ba1696a6068e7',
      entranceRateDirectFeeAddress: '0x8f8ED42F78A664D5779cB858614529E1D437c2Fb',
      exitRateBurnFeeAddress: '0x564473Cb3c681c616db8A65f99af7Bb65Db32471',
      exitRateDirectFeeAddress: '0x96eeE1bb0f4D048C65a98ecACC31514a11772220',
      externalPositionFactoryAddress: '0xa3Dc3BffCd6394721097dF69134E6387226589F5',
      externalPositionManagerAddress: '0xfE17753aEd3e3B70129F70ED34B609Ff46Bfe8C7',
      feeManagerAddress: '0x4CC2a26a2FffdB692Beae2f78aB918Ac745f7887',
      fundDeployerAddress: '0x8C14892177FF33e51CFf01F1294bDF8F3C0972b3',
      gasRelayPaymasterFactoryAddress: '0x8A9B3673e0217E25011379844128e7BcE754c60A',
      globalConfigLibAddress: '0x6Ac0d79705E7778fE0E5a4762ceAA0f5D1778c6F',
      guaranteedRedemptionPolicyAddress: '0xD2b1B15584e6e2f0EF89E85700466f7945C52A0D',
      integrationManagerAddress: '0xCd11FA05615371ceeB3D5B91B2056AF2dc774718',
      managementFeeAddress: '0xCef9CAE419c84C4a9C98f56aDF7bbee789926518',
      minMaxInvestmentPolicyAddress: '0x1AD981E907461A2D23456844bEf08a74143984b4',
      performanceFeeAddress: '0x87b9D59053eBb75cA9B27d3D9fa450Bd04FA568E',
      policyManagerAddress: '0xA6433dbad11ED31912Dc9e15F2fAC6e8f5de7458',
      protocolFeeReserveLibAddress: '0x6686D850b5831291d1994606b0c2115457862D50',
      protocolFeeTrackerAddress: '0x71c90C52326DC1E7f950F2deCe248F4Eda58Ef54',
      valueInterpreterAddress: '0x6a88597809B8c74971f0575F8922423d8c069860',
      vaultLibAddress: '0xd77D0A551320154ecD3DFFc5678914349359C08c',
    },
  },
};
