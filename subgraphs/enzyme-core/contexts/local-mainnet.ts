import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';

export const localMainnetContext: Context<Variables> = {
  local: true,
  name: 'enzymefinance/enzyme-core',
  network: 'mainnet',
  variables: {
    block: 11636493,
    dispatcherAddress: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
    wethTokenAddress: '0x0000000000000000000000000000000000000000',
    release2: {
      fundDeployerAddress: '0x9134C9975244b46692Ad9A7Da36DBa8734Ec6DA3',
      vaultLibAddress: '0xAC3fe07F51C51153E181bE892e4e37326EEA13Da',
      comptrollerLibAddress: '0x94F262802806BE3646612D0705802710dD5B58dF',
      valueInterpreterAddress: '0x6618bF56E1C7b6c8310Bfe4096013bEd8F191628',
      integrationManagerAddress: '0xFc3f356217120318Bd46c879b3A55C3135473752',
      policyManagerAddress: '0x4c2c07b15b0b32Bad989d9DeFaeC775e2aA8A7AD',
      feeManagerAddress: '0xEcDbcdB8Dbf0AC54f47E41D3DD0C7DaE07828aAa',

      // Prices
      aggregatedDerivativePriceFeedAddress: '0xCFb6F4C08856986d13839B1907b5c645EE95388F',
      chainlinkPriceFeedAddress: '0xfB3A9655F5feA18caC92021E83550F829ae6F7F7',

      // Fees
      managementFeeAddress: '0x889f2FCB6c12d836cB8f7567A1bdfa512FE9f647',
      performanceFeeAddress: '0x70478df01108Cb2fCB23463814e648363CE17720',
      entranceRateBurnFeeAddress: '0xA831a43f99af957bc27D03963958Fd710DC1f50E',
      entranceRateDirectFeeAddress: '0x42bc95f119Fb08b9FC72262D255016fa5546caa4',

      // Policies
      adapterBlacklistAddress: '0x9f471f573414d9cAcFe3A0127aD12F195504de7B',
      adapterWhitelistAddress: '0xb4dF8b4f3eC62619E8D2aed5df360aa393BB8745',
      assetBlacklistAddress: '0x2A7CD39427831045e7050723006697fD0801B184',
      assetWhitelistAddress: '0x664F6C88CA8d5888b11B97450A5623003b8981B9',
      investorWhitelistAddress: '0x3C8a4DaCe64B238C8307E3AF563fCf76Cf870d57',
      guaranteedRedemptionAddress: '0xda9d4Ee6C846E0b504979ea3d607c2e98574A09C',
      maxConcentrationAddress: '0x6b9a7604faB14721B51A89Cd1CcEF639Da8664eE',
      minMaxInvestmentAddress: '0xDCCae078656f20B0851Dd35683315be56AEEe8f3',
      buySharesCallerWhitelistAddress: '0x21fc97450c65dAfe14255A06Cf9c5C88483bA309',
    },
    release3: {
      fundDeployerAddress: '0x7e6d3b1161DF9c9c7527F68d651B297d2Fdb820B',
      vaultLibAddress: '0x1b3694907Ed7459c7B0116e7c6a4B7788288577F',
      comptrollerLibAddress: '0x1A7CBEDf13E25818dC377d2B1277E03e5d496300',
      valueInterpreterAddress: '0x10a5624840Ac07287f756777DF1DEC34d2C2d654',
      integrationManagerAddress: '0x965ca477106476B4600562a2eBe13536581883A6',
      policyManagerAddress: '0x0Bd9f0465d21d4c300c7B8d781A013bdc87A31E8',
      feeManagerAddress: '0x5d0a363e9a17fb839e2843ffa93c808cdafccb67',

      // Prices
      aggregatedDerivativePriceFeedAddress: '0x2E45f9B3fd5871cCaf4eB415dFCcbDD126F57C4f',
      chainlinkPriceFeedAddress: '0x1fad8faf11E027f8630F394599830dBeb97004EE',

      // Fees
      managementFeeAddress: '0x45f1b268cc6412b454dae20f8971fc4a36af0d29',
      performanceFeeAddress: '0x3c3f9143A15042B69eB314Cac211688A4E71a087',
      entranceRateBurnFeeAddress: '0x27F74B89B29508091014487253d8D9b88aa0264A',
      entranceRateDirectFeeAddress: '0x30a398Eb63B62bF2865F90e37752c8300Ef22F05',

      // Policies
      adapterBlacklistAddress: '0xA2A031B137452986B0E8fA32c9430D29b9b0494F',
      adapterWhitelistAddress: '0x306f571110C5441a8481d3CD7E8B16A7E2E967E3',
      assetBlacklistAddress: '0xdC1e40174ad831e505E8191881A66e90c3681E33',
      assetWhitelistAddress: '0xA3b7B872407452E38dFfACa8dA2dB3eD6D756Ad1',
      investorWhitelistAddress: '0x775f8d5d016c4d8a1427982148ec2170282c7784',
      guaranteedRedemptionAddress: '0x08d4225f0995d770c4c8ea85380602b3499164a9',
      maxConcentrationAddress: '0xdee63b253432a443a09bf8461f20256d184319de',
      minMaxInvestmentAddress: '0x016a7287f0fdbdce5f903334f574b2238be3fa25',
      buySharesCallerWhitelistAddress: '0xbc91dcc90ccdd0b51e3c623528cb886358c60105',
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
