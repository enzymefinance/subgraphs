import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';

export const kovanContext: Context<Variables> = {
  name: 'enzymefinance/enzyme-core-kovan',
  network: 'kovan',
  variables: {
    block: 26943646,
    dispatcherAddress: '0xdA048Eb415a8d43cAE7802350ADE332CF4211429',
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
      fundDeployerAddress: '0x8014FC071eCae28FE7FB9D4e3f81862fc057498B',
      vaultLibAddress: '0x0954d5301B848B69ED834dd8ac17aCEBbE1f1ceF',
      comptrollerLibAddress: '0xD7A47C81d0b7b2fBeb86670DdA85032d764FB380',
      valueInterpreterAddress: '0xeE9AF7DD3C2Cc9620deFdFe6f5072295494606F4',
      integrationManagerAddress: '0x7bd321AA270F87e1573dA4c2eBB1D47c7ddEA615',
      policyManagerAddress: '0xA3162e0a85Ef3c45eeF09C9d2Fd7FaD25896e5e0',
      feeManagerAddress: '0xb10dfB34d7C6C2Ce7815D743b981A5C906F1112E',
      globalConfigLibAddress: '0xB430D63a522ea0420Db2CD94F6385f97808d89FA',

      // External Positions
      externalPositionFactoryAddress: '0xdFaff062AaaE022637B29C7E3Dede1A1135a47b6',
      externalPositionManagerAddress: '0x2516f285C7cE40BB193a1f76a3F61eD8eEFcFc5E',

      // Gas Relayer
      gasRelayPaymasterFactoryAddress: '0xdeD12df0c1352f342E9B69C9C5c0f8DF48F281cF',

      // Protocol Feed
      protocolFeeReserveLibAddress: '0xF546fF0DD7259f15028Cbb32Bd39768382283D00',
      protocolFeeTrackerAddress: '0x8a1432C72AD82617e78C5F7cc80F363819a1F47a',

      // Fees
      managementFeeAddress: '0x47118c0af2F3d75057b757FD55C4570BF695117a',
      performanceFeeAddress: '0x79EAb2fbDe38Eee51f807a37b2f1377C0db56053',
      entranceRateBurnFeeAddress: '0x5ea830d309CB7a629C1a9463E3E437550a9a270E',
      entranceRateDirectFeeAddress: '0x95E0B46b1960d83986C119D32B17E5ff4AE56051',
      exitRateBurnFeeAddress: '0x5797eCf5B60048446B2DD9f112f86f4ec10206f4',
      exitRateDirectFeeAddress: '0x5182bFC1E501C3f63e96C23E03F85E069bDbBE11',

      // Policies
      allowedAdapterIncomingAssetsPolicyAddress: '0x04b91AB04C61204eF8Ce0ad1aAf04575Ad4F9684',
      allowedDepositRecipientsPolicyAddress: '0x72f8594E88Aeb9B7EAaA1465D361fF5E8AA8cd9C',
      guaranteedRedemptionPolicyAddress: '0xa6204bf6a9FaC240B074c304b39AF50753A7AE68',
      minMaxInvestmentPolicyAddress: '0x3e70A80A661834FaBC1bA94b703E2C71dBa5bdE8',
    },
  },
};
