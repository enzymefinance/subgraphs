// @ts-ignore
import path from 'path';
import {
  Configurator,
  Contexts,
  Template,
  EventHandlerDeclaration,
  AbiDeclaration,
  DataSourceTemplateDeclaration,
  DataSourceDeclaration,
} from '@enzymefinance/subgraph-cli';

export class ReleaseAddresses {
  fundDeployerAddress: string;
  vaultLibAddress: string;
  comptrollerLibAddress: string;
  valueInterpreterAddress: string;
  integrationManagerAddress: string;
  policyManagerAddress: string;
  feeManagerAddress: string;
  aggregatedDerivativePriceFeedAddress: string;
  chainlinkPriceFeedAddress: string;
  aavePriceFeedAddress: string;
  alphaHomoraV1PriceFeedAddress: string;
  chaiPriceFeedAddress: string;
  compoundPriceFeedAddress: string;
  curvePriceFeedAddress: string;
  idlePriceFeedAddress: string;
  lidoStethPriceFeedAddress: string;
  stakehoundEthPriceFeedAddress: string;
  synthetixPriceFeedAddress: string;
  uniswapV2PoolPriceFeedAddress: string;
  wdgldPriceFeedAddress: string;
  fundActionsWrapperAddress: string;
  authUserExecutedSharesRequestorFactoryAddress: string;
  managementFeeAddress: string;
  performanceFeeAddress: string;
  entranceRateBurnFeeAddress: string;
  entranceRateDirectFeeAddress: string;
  adapterBlacklistAddress: string;
  adapterWhitelistAddress: string;
  assetBlacklistAddress: string;
  assetWhitelistAddress: string;
  investorWhitelistAddress: string;
  guaranteedRedemptionAddress: string;
  maxConcentrationAddress: string;
  minMaxInvestmentAddress: string;
  buySharesCallerWhitelistAddress: string;
  aaveAdapterAddress: string;
  alphaHomoraV1AdapterAddress: string;
  chaiAdapterAddress: string;
  compoundAdapterAddress: string;
  curveExchangeAdapterAddress: string;
  curveLiquidityAaveAdapterAddress: string;
  curveLiquiditySethAdapterAddress: string;
  curveLiquidityStethAdapterAddress: string;
  idleAdapterAddress: string;
  kyberAdapterAddress: string;
  paraSwapAdapterAddress: string;
  paraSwapV4AdapterAddress: string;
  synthetixAdapterAddress: string;
  trackedAssetsAdapterAddress: string;
  uniswapV2AdapterAddress: string;
  zeroExV2AdapterAddress: string;
}

interface Variables {
  block: number;
  dispatcherAddress: string;
  releaseA: ReleaseAddresses;
  releaseB: ReleaseAddresses;
}

export const contexts: Contexts<Variables> = {
  local: {
    local: true,
    name: 'enzymefinance/enzyme-core',
    network: 'kovan',
    variables: {
      block: 24710049,
      dispatcherAddress: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
      releaseA: {
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

        // Derivative Price Feeds
        aavePriceFeedAddress: '0x3996D53013f562FD6D5B777Ab0Ee681802698e0D',
        alphaHomoraV1PriceFeedAddress: '0x5f2E2E7FfbcAeE69d570D531A00228322632231E',
        chaiPriceFeedAddress: '0x8bA6f2D9C81Db32665df6a926227dD00cacA7d9B',
        compoundPriceFeedAddress: '0xC80bD25cd46e49277CcB56E751704A6316Af30aD',
        curvePriceFeedAddress: '0x884D909EA86EC61128a4cFE1B455d5B440cdE9C8',
        idlePriceFeedAddress: '0x08eCd9e1378DC0262df826C07D3D64c728a46829',
        lidoStethPriceFeedAddress: '0x4F3Da46BF999C6b3005C1465672009fBF99e7b9f',
        stakehoundEthPriceFeedAddress: '0xe2b19fa2d662f4eea51d394b71ce7281214840c5',
        synthetixPriceFeedAddress: '0x2180341339010C237FF8e3dd1fF24063FB18C4D0',
        uniswapV2PoolPriceFeedAddress: '0x9177A3354EE50bffBcC42C4c6baC27ed63979097',
        wdgldPriceFeedAddress: '0x45919dcDECcA3C7a0D29f959E6b78a605a17A3A2',

        // Peripheral
        fundActionsWrapperAddress: '0x38c9f2870003d47f704e317C10f93Ca1ddAE67C1',
        authUserExecutedSharesRequestorFactoryAddress: '0x402dC740e4C266C640C4477b5649c75A86AAF780',

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

        // Adapters
        aaveAdapterAddress: '0x14c6b99AfFC61e9b0753146F3437A223d0c58279',
        alphaHomoraV1AdapterAddress: '0xed6Bdfa2725da6687bC89Bcb0BDB1e5dEAe15838',
        chaiAdapterAddress: '0xB3646e9B6dF463a2dC36de67FFD28cbAb3f8A5cC',
        compoundAdapterAddress: '0xD050DC9E75f24Ae653d282D0cFb772871729e710',
        curveExchangeAdapterAddress: '0x402A81aD2972a017B4564453E69afaE2b006A7E2',
        curveLiquidityAaveAdapterAddress: '0xF6F7cc9464Cb15e0A5B116D738dCa88434bbA00A',
        curveLiquiditySethAdapterAddress: '0xbD81a0eF03F4eD89F73a30eb33137787BF92e177',
        curveLiquidityStethAdapterAddress: '0x3Bb38E67033e24E604e53964A99D914f8B216521',
        idleAdapterAddress: '0x2f7918d9a98c199173fb8ca989b408b4fb1ea441',
        kyberAdapterAddress: '0x963E9C15a26d74085ABfC8B48280b650426F998e',
        paraSwapAdapterAddress: '0x56a1892b2276bbb9968d1b5aa0000a71bf0fa7b8',
        paraSwapV4AdapterAddress: '0x1c1b94812faf3de496a2634b36c1fbc6e5c222e7',
        synthetixAdapterAddress: '0xBF3411973F09c32E8c4e67d1345DdDC5F9c7535a',
        trackedAssetsAdapterAddress: '0xde4A42052db0FB0E8935C9F3015b8cd56A3dDF43',
        uniswapV2AdapterAddress: '0x972318a0f4935c3153a2AA4c81274DfF621B360b',
        zeroExV2AdapterAddress: '0x4205073e7AD2F9896F827DBCe496dd2306DB602e',
      },
      releaseB: {
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

        // Derivative Price Feeds
        aavePriceFeedAddress: '0x4e49a272dC42E26C8772de366aaa93d1AC816794',
        alphaHomoraV1PriceFeedAddress: '0x1a8b4f6D469Ee775d5982C4d4AAb46677c2C92d4',
        chaiPriceFeedAddress: '0x0000000000000000000000000000000000000000',
        compoundPriceFeedAddress: '0x6d7F71Cc3109D4132Ad6124D84e72E353b979880',
        curvePriceFeedAddress: '0xc106f1B01017c854a9cd2D88Db733408236DD809',
        idlePriceFeedAddress: '0x13c2263e534BD27149d96b8Cb9961ea1beB560Ef',
        lidoStethPriceFeedAddress: '0x11D8d414724281BD702838BA16C8F15F7C473e9a',
        stakehoundEthPriceFeedAddress: '0xd3C515EAD7Bcc7451cd920e066C4a1849B827dfD',
        synthetixPriceFeedAddress: '0x4158F02ac2fF0f0E7959A768D06619B685aBF0C8',
        uniswapV2PoolPriceFeedAddress: '0x37FFB1842eF012d83A6FFdc92A6353044Ae0e3e8',
        wdgldPriceFeedAddress: '0x76b548553d4E729c81e8ae8Ab826795bd88BA9E7',

        // Peripheral
        fundActionsWrapperAddress: '0xbc9a63cad5a825bD5854Abca4f3D42d6aCF9Bffa',
        authUserExecutedSharesRequestorFactoryAddress: '0x0000000000000000000000000000000000000000',

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

        // Adapters
        aaveAdapterAddress: '0x0Bad0886c5976072549687D5FfCD26803C5bA167',
        alphaHomoraV1AdapterAddress: '0x63765Ae5Df9bB8AF9D8bc976E595b79907CF341c',
        chaiAdapterAddress: '0x0000000000000000000000000000000000000000',
        compoundAdapterAddress: '0xb7bfd3582582A82Ef2A2f0Df0adf705f35A07D4B',
        curveExchangeAdapterAddress: '0x1990D8Bc382D38fA21EE3B570e9d1E6272152165',
        curveLiquidityAaveAdapterAddress: '0x78bA80C8517A4f3146FD76A3642Fa57B77F331eb',
        curveLiquiditySethAdapterAddress: '0xeE91E3bB4752F358DDAaC6ab825536698b239546',
        curveLiquidityStethAdapterAddress: '0x6367bb496390dDf0ef508Db2992F53DBf376b1f4',
        idleAdapterAddress: '0x649b6cc835c8fe3d3b94b6a9c155f791bf500dfe',
        kyberAdapterAddress: '0x4ff16EfF3b6D2175A513EF4c5b95f5f4D2F05179',
        paraSwapAdapterAddress: '0x0000000000000000000000000000000000000000',
        paraSwapV4AdapterAddress: '0x8eA6Ca02274E1b05b70c11058213ADC667258C3D',
        synthetixAdapterAddress: '0x07698c3fa26a62ec6320872bf2950ba160a2dd7c',
        trackedAssetsAdapterAddress: '0x2e8b6455cb06463a523d3318f2cdc6a55ed45118',
        uniswapV2AdapterAddress: '0x8481150a0f36c98EE859e6C7B46d61FDD836768f',
        zeroExV2AdapterAddress: '0x9b6cD2195d3c275875cB469A59dd437995712550',
      },
    },
  },
  kovan: {
    name: 'enzymefinance/enzyme-core-kovan',
    network: 'kovan',
    variables: {
      block: 24710049,
      dispatcherAddress: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
      releaseA: {
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

        // Derivative Price Feeds
        aavePriceFeedAddress: '0x3996D53013f562FD6D5B777Ab0Ee681802698e0D',
        alphaHomoraV1PriceFeedAddress: '0x5f2E2E7FfbcAeE69d570D531A00228322632231E',
        chaiPriceFeedAddress: '0x8bA6f2D9C81Db32665df6a926227dD00cacA7d9B',
        compoundPriceFeedAddress: '0xC80bD25cd46e49277CcB56E751704A6316Af30aD',
        curvePriceFeedAddress: '0x884D909EA86EC61128a4cFE1B455d5B440cdE9C8',
        idlePriceFeedAddress: '0x08eCd9e1378DC0262df826C07D3D64c728a46829',
        lidoStethPriceFeedAddress: '0x4F3Da46BF999C6b3005C1465672009fBF99e7b9f',
        stakehoundEthPriceFeedAddress: '0xe2b19fa2d662f4eea51d394b71ce7281214840c5',
        synthetixPriceFeedAddress: '0x2180341339010C237FF8e3dd1fF24063FB18C4D0',
        uniswapV2PoolPriceFeedAddress: '0x9177A3354EE50bffBcC42C4c6baC27ed63979097',
        wdgldPriceFeedAddress: '0x45919dcDECcA3C7a0D29f959E6b78a605a17A3A2',

        // Peripheral
        fundActionsWrapperAddress: '0x38c9f2870003d47f704e317C10f93Ca1ddAE67C1',
        authUserExecutedSharesRequestorFactoryAddress: '0x402dC740e4C266C640C4477b5649c75A86AAF780',

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

        // Adapters
        aaveAdapterAddress: '0x14c6b99AfFC61e9b0753146F3437A223d0c58279',
        alphaHomoraV1AdapterAddress: '0xed6Bdfa2725da6687bC89Bcb0BDB1e5dEAe15838',
        chaiAdapterAddress: '0xB3646e9B6dF463a2dC36de67FFD28cbAb3f8A5cC',
        compoundAdapterAddress: '0xD050DC9E75f24Ae653d282D0cFb772871729e710',
        curveExchangeAdapterAddress: '0x402A81aD2972a017B4564453E69afaE2b006A7E2',
        curveLiquidityAaveAdapterAddress: '0xF6F7cc9464Cb15e0A5B116D738dCa88434bbA00A',
        curveLiquiditySethAdapterAddress: '0xbD81a0eF03F4eD89F73a30eb33137787BF92e177',
        curveLiquidityStethAdapterAddress: '0x3Bb38E67033e24E604e53964A99D914f8B216521',
        idleAdapterAddress: '0x2f7918d9a98c199173fb8ca989b408b4fb1ea441',
        kyberAdapterAddress: '0x963E9C15a26d74085ABfC8B48280b650426F998e',
        paraSwapAdapterAddress: '0x56a1892b2276bbb9968d1b5aa0000a71bf0fa7b8',
        paraSwapV4AdapterAddress: '0x1c1b94812faf3de496a2634b36c1fbc6e5c222e7',
        synthetixAdapterAddress: '0xBF3411973F09c32E8c4e67d1345DdDC5F9c7535a',
        trackedAssetsAdapterAddress: '0xde4A42052db0FB0E8935C9F3015b8cd56A3dDF43',
        uniswapV2AdapterAddress: '0x972318a0f4935c3153a2AA4c81274DfF621B360b',
        zeroExV2AdapterAddress: '0x4205073e7AD2F9896F827DBCe496dd2306DB602e',
      },
      releaseB: {
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

        // Derivative Price Feeds
        aavePriceFeedAddress: '0x4e49a272dC42E26C8772de366aaa93d1AC816794',
        alphaHomoraV1PriceFeedAddress: '0x1a8b4f6D469Ee775d5982C4d4AAb46677c2C92d4',
        chaiPriceFeedAddress: '0x0000000000000000000000000000000000000000',
        compoundPriceFeedAddress: '0x6d7F71Cc3109D4132Ad6124D84e72E353b979880',
        curvePriceFeedAddress: '0xc106f1B01017c854a9cd2D88Db733408236DD809',
        idlePriceFeedAddress: '0x13c2263e534BD27149d96b8Cb9961ea1beB560Ef',
        lidoStethPriceFeedAddress: '0x11D8d414724281BD702838BA16C8F15F7C473e9a',
        stakehoundEthPriceFeedAddress: '0xd3C515EAD7Bcc7451cd920e066C4a1849B827dfD',
        synthetixPriceFeedAddress: '0x4158F02ac2fF0f0E7959A768D06619B685aBF0C8',
        uniswapV2PoolPriceFeedAddress: '0x37FFB1842eF012d83A6FFdc92A6353044Ae0e3e8',
        wdgldPriceFeedAddress: '0x76b548553d4E729c81e8ae8Ab826795bd88BA9E7',

        // Peripheral
        fundActionsWrapperAddress: '0xbc9a63cad5a825bD5854Abca4f3D42d6aCF9Bffa',
        authUserExecutedSharesRequestorFactoryAddress: '0x0000000000000000000000000000000000000000',

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

        // Adapters
        aaveAdapterAddress: '0x0Bad0886c5976072549687D5FfCD26803C5bA167',
        alphaHomoraV1AdapterAddress: '0x63765Ae5Df9bB8AF9D8bc976E595b79907CF341c',
        chaiAdapterAddress: '0x0000000000000000000000000000000000000000',
        compoundAdapterAddress: '0xb7bfd3582582A82Ef2A2f0Df0adf705f35A07D4B',
        curveExchangeAdapterAddress: '0x1990D8Bc382D38fA21EE3B570e9d1E6272152165',
        curveLiquidityAaveAdapterAddress: '0x78bA80C8517A4f3146FD76A3642Fa57B77F331eb',
        curveLiquiditySethAdapterAddress: '0xeE91E3bB4752F358DDAaC6ab825536698b239546',
        curveLiquidityStethAdapterAddress: '0x6367bb496390dDf0ef508Db2992F53DBf376b1f4',
        idleAdapterAddress: '0x649b6cc835c8fe3d3b94b6a9c155f791bf500dfe',
        kyberAdapterAddress: '0x4ff16EfF3b6D2175A513EF4c5b95f5f4D2F05179',
        paraSwapAdapterAddress: '0x0000000000000000000000000000000000000000',
        paraSwapV4AdapterAddress: '0x8eA6Ca02274E1b05b70c11058213ADC667258C3D',
        synthetixAdapterAddress: '0x07698c3fa26a62ec6320872bf2950ba160a2dd7c',
        trackedAssetsAdapterAddress: '0x2e8b6455cb06463a523d3318f2cdc6a55ed45118',
        uniswapV2AdapterAddress: '0x8481150a0f36c98EE859e6C7B46d61FDD836768f',
        zeroExV2AdapterAddress: '0x9b6cD2195d3c275875cB469A59dd437995712550',
      },
    },
  },
  mainnet: {
    name: 'enzymefinance/enzyme-core',
    network: 'mainnet',
    variables: {
      block: 11636493,
      dispatcherAddress: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
      releaseA: {
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

        // Derivative Price Feeds
        aavePriceFeedAddress: '0x3996D53013f562FD6D5B777Ab0Ee681802698e0D',
        alphaHomoraV1PriceFeedAddress: '0x5f2E2E7FfbcAeE69d570D531A00228322632231E',
        chaiPriceFeedAddress: '0x8bA6f2D9C81Db32665df6a926227dD00cacA7d9B',
        compoundPriceFeedAddress: '0xC80bD25cd46e49277CcB56E751704A6316Af30aD',
        curvePriceFeedAddress: '0x884D909EA86EC61128a4cFE1B455d5B440cdE9C8',
        idlePriceFeedAddress: '0x08eCd9e1378DC0262df826C07D3D64c728a46829',
        lidoStethPriceFeedAddress: '0x4F3Da46BF999C6b3005C1465672009fBF99e7b9f',
        stakehoundEthPriceFeedAddress: '0xe2b19fa2d662f4eea51d394b71ce7281214840c5',
        synthetixPriceFeedAddress: '0x2180341339010C237FF8e3dd1fF24063FB18C4D0',
        uniswapV2PoolPriceFeedAddress: '0x9177A3354EE50bffBcC42C4c6baC27ed63979097',
        wdgldPriceFeedAddress: '0x45919dcDECcA3C7a0D29f959E6b78a605a17A3A2',

        // Peripheral
        fundActionsWrapperAddress: '0x38c9f2870003d47f704e317C10f93Ca1ddAE67C1',
        authUserExecutedSharesRequestorFactoryAddress: '0x402dC740e4C266C640C4477b5649c75A86AAF780',

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

        // Adapters
        aaveAdapterAddress: '0x14c6b99AfFC61e9b0753146F3437A223d0c58279',
        alphaHomoraV1AdapterAddress: '0xed6Bdfa2725da6687bC89Bcb0BDB1e5dEAe15838',
        chaiAdapterAddress: '0xB3646e9B6dF463a2dC36de67FFD28cbAb3f8A5cC',
        compoundAdapterAddress: '0xD050DC9E75f24Ae653d282D0cFb772871729e710',
        curveExchangeAdapterAddress: '0x402A81aD2972a017B4564453E69afaE2b006A7E2',
        curveLiquidityAaveAdapterAddress: '0xF6F7cc9464Cb15e0A5B116D738dCa88434bbA00A',
        curveLiquiditySethAdapterAddress: '0xbD81a0eF03F4eD89F73a30eb33137787BF92e177',
        curveLiquidityStethAdapterAddress: '0x3Bb38E67033e24E604e53964A99D914f8B216521',
        idleAdapterAddress: '0x2f7918d9a98c199173fb8ca989b408b4fb1ea441',
        kyberAdapterAddress: '0x963E9C15a26d74085ABfC8B48280b650426F998e',
        paraSwapAdapterAddress: '0x56a1892b2276bbb9968d1b5aa0000a71bf0fa7b8',
        paraSwapV4AdapterAddress: '0x1c1b94812faf3de496a2634b36c1fbc6e5c222e7',
        synthetixAdapterAddress: '0xBF3411973F09c32E8c4e67d1345DdDC5F9c7535a',
        trackedAssetsAdapterAddress: '0xde4A42052db0FB0E8935C9F3015b8cd56A3dDF43',
        uniswapV2AdapterAddress: '0x972318a0f4935c3153a2AA4c81274DfF621B360b',
        zeroExV2AdapterAddress: '0x4205073e7AD2F9896F827DBCe496dd2306DB602e',
      },
      releaseB: {
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

        // Derivative Price Feeds
        aavePriceFeedAddress: '0x4e49a272dC42E26C8772de366aaa93d1AC816794',
        alphaHomoraV1PriceFeedAddress: '0x1a8b4f6D469Ee775d5982C4d4AAb46677c2C92d4',
        chaiPriceFeedAddress: '0x0000000000000000000000000000000000000000',
        compoundPriceFeedAddress: '0x6d7F71Cc3109D4132Ad6124D84e72E353b979880',
        curvePriceFeedAddress: '0xc106f1B01017c854a9cd2D88Db733408236DD809',
        idlePriceFeedAddress: '0x13c2263e534BD27149d96b8Cb9961ea1beB560Ef',
        lidoStethPriceFeedAddress: '0x11D8d414724281BD702838BA16C8F15F7C473e9a',
        stakehoundEthPriceFeedAddress: '0xd3C515EAD7Bcc7451cd920e066C4a1849B827dfD',
        synthetixPriceFeedAddress: '0x4158F02ac2fF0f0E7959A768D06619B685aBF0C8',
        uniswapV2PoolPriceFeedAddress: '0x37FFB1842eF012d83A6FFdc92A6353044Ae0e3e8',
        wdgldPriceFeedAddress: '0x76b548553d4E729c81e8ae8Ab826795bd88BA9E7',

        // Peripheral
        fundActionsWrapperAddress: '0xbc9a63cad5a825bD5854Abca4f3D42d6aCF9Bffa',
        authUserExecutedSharesRequestorFactoryAddress: '0x0000000000000000000000000000000000000000',

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

        // Adapters
        aaveAdapterAddress: '0x0Bad0886c5976072549687D5FfCD26803C5bA167',
        alphaHomoraV1AdapterAddress: '0x63765Ae5Df9bB8AF9D8bc976E595b79907CF341c',
        chaiAdapterAddress: '0x0000000000000000000000000000000000000000',
        compoundAdapterAddress: '0xb7bfd3582582A82Ef2A2f0Df0adf705f35A07D4B',
        curveExchangeAdapterAddress: '0x1990D8Bc382D38fA21EE3B570e9d1E6272152165',
        curveLiquidityAaveAdapterAddress: '0x78bA80C8517A4f3146FD76A3642Fa57B77F331eb',
        curveLiquiditySethAdapterAddress: '0xeE91E3bB4752F358DDAaC6ab825536698b239546',
        curveLiquidityStethAdapterAddress: '0x6367bb496390dDf0ef508Db2992F53DBf376b1f4',
        idleAdapterAddress: '0x649b6cc835c8fe3d3b94b6a9c155f791bf500dfe',
        kyberAdapterAddress: '0x4ff16EfF3b6D2175A513EF4c5b95f5f4D2F05179',
        paraSwapAdapterAddress: '0x0000000000000000000000000000000000000000',
        paraSwapV4AdapterAddress: '0x8eA6Ca02274E1b05b70c11058213ADC667258C3D',
        synthetixAdapterAddress: '0x07698c3fa26a62ec6320872bf2950ba160a2dd7c',
        trackedAssetsAdapterAddress: '0x2e8b6455cb06463a523d3318f2cdc6a55ed45118',
        uniswapV2AdapterAddress: '0x8481150a0f36c98EE859e6C7B46d61FDD836768f',
        zeroExV2AdapterAddress: '0x9b6cD2195d3c275875cB469A59dd437995712550',
      },
    },
  },
};

export const templates: Template[] = [
  {
    template: 'templates/addresses.ts',
    destination: 'generated/addresses.ts',
  },
];

function abi(file: string): AbiDeclaration {
  const name = `${path.basename(file, '.json')}Contract`;
  return { name, file };
}

function event(event: string): EventHandlerDeclaration {
  // @ts-ignore
  const [handler] = event.split('(', 1).map((event) => `handle${event}`);
  return { event, handler };
}

interface SourceOptions {
  name: string;
  events: string[];
  suffix?: string;
  block?: number;
  address?: string;
}

function source(options: SourceOptions): DataSourceDeclaration {
  return {
    name: `${options.name}${options.suffix != null ? options.suffix : ''}DataSource`,
    abi: `${options.name}Contract`,
    file: `mappings/${options.name}.ts`,
    events: options.events.map((signature) => event(signature)),
    ...(options.address ? { address: options.address } : undefined),
    ...(options.block ? { block: options.block } : undefined),
  };
}

interface TemplateOptions {
  name: string;
  events: string[];
  block?: number;
  address?: string;
}

function template(name: string, events: string[]) {
  return source({ name, events }) as DataSourceTemplateDeclaration;
}

export const configure: Configurator<Variables> = (variables) => {
  const abis = [
    '@chainlink/contracts/abi/v0.6/AggregatorInterface.json',
    '@enzymefinance/enzyme-core-subgraph/utils/abis/CurveRegistry.json',
    '@enzymefinance/protocol/artifacts/CompoundAdapter.json',
    '@enzymefinance/protocol/artifacts/MinMaxInvestment.json',
    '@enzymefinance/protocol/artifacts/FundActionsWrapper.json',
    '@enzymefinance/protocol/artifacts/IUniswapV2Pair.json',
    '@enzymefinance/protocol/artifacts/ValueInterpreter.json',
    '@enzymefinance/protocol/artifacts/IUniswapV2Pair.json',
    '@enzymefinance/protocol/artifacts/ICERC20.json',
    '@enzymefinance/protocol/artifacts/AavePriceFeed.json',
    '@enzymefinance/protocol/artifacts/AlphaHomoraV1PriceFeed.json',
    '@enzymefinance/protocol/artifacts/ChaiPriceFeed.json',
    '@enzymefinance/protocol/artifacts/CompoundPriceFeed.json',
    '@enzymefinance/protocol/artifacts/CurvePriceFeed.json',
    '@enzymefinance/protocol/artifacts/ICurveAddressProvider.json',
    '@enzymefinance/protocol/artifacts/IdlePriceFeed.json',
    '@enzymefinance/protocol/artifacts/StakehoundEthPriceFeed.json',
    '@enzymefinance/protocol/artifacts/SynthetixPriceFeed.json',
    '@enzymefinance/protocol/artifacts/UniswapV2PoolPriceFeed.json',
    '@enzymefinance/protocol/artifacts/Dispatcher.json',
    '@enzymefinance/protocol/artifacts/FundDeployer.json',
    '@enzymefinance/protocol/artifacts/FeeManager.json',
    '@enzymefinance/protocol/artifacts/EntranceRateDirectFee.json',
    '@enzymefinance/protocol/artifacts/EntranceRateBurnFee.json',
    '@enzymefinance/protocol/artifacts/ManagementFee.json',
    '@enzymefinance/protocol/artifacts/PerformanceFee.json',
    '@enzymefinance/protocol/artifacts/IntegrationManager.json',
    '@enzymefinance/protocol/artifacts/PolicyManager.json',
    '@enzymefinance/protocol/artifacts/AdapterBlacklist.json',
    '@enzymefinance/protocol/artifacts/AdapterWhitelist.json',
    '@enzymefinance/protocol/artifacts/AssetBlacklist.json',
    '@enzymefinance/protocol/artifacts/AssetWhitelist.json',
    '@enzymefinance/protocol/artifacts/GuaranteedRedemption.json',
    '@enzymefinance/protocol/artifacts/InvestorWhitelist.json',
    '@enzymefinance/protocol/artifacts/MaxConcentration.json',
    '@enzymefinance/protocol/artifacts/AggregatedDerivativePriceFeed.json',
    '@enzymefinance/protocol/artifacts/ChainlinkPriceFeed.json',
    '@enzymefinance/protocol/artifacts/VaultLib.json',
    '@enzymefinance/protocol/artifacts/ComptrollerLib.json',
  ].map((name) => abi(name));

  const dispatcher: SourceOptions = {
    name: 'Dispatcher',
    block: variables.block,
    address: variables.dispatcherAddress,
    events: [
      'VaultProxyDeployed(indexed address,indexed address,address,indexed address,address,string)',
      'CurrentFundDeployerSet(address,address)',
      'MigrationCancelled(indexed address,indexed address,indexed address,address,address,uint256)',
      'MigrationExecuted(indexed address,indexed address,indexed address,address,address,uint256)',
      'MigrationSignaled(indexed address,indexed address,indexed address,address,address,uint256)',
      'MigrationInCancelHookFailed(bytes,indexed address,indexed address,indexed address,address,address)',
      'MigrationOutHookFailed(bytes,uint8,indexed address,indexed address,indexed address,address,address)',
      'MigrationTimelockSet(uint256,uint256)',
      'NominatedOwnerRemoved(indexed address)',
      'NominatedOwnerSet(indexed address)',
      'OwnershipTransferred(indexed address,indexed address)',
      'SharesTokenSymbolSet(string)',
      'VaultProxyDeployed(indexed address,indexed address,address,indexed address,address,string)',
    ],
  };

  const releases: SourceOptions[][] = [variables.releaseA, variables.releaseB]
    .map((release) => [
      {
        name: 'FundDeployer',
        block: variables.block,
        address: release.fundDeployerAddress,
        events: [
          'ComptrollerLibSet(address)',
          'ComptrollerProxyDeployed(indexed address,address,indexed address,uint256,bytes,bytes,indexed bool)',
          'NewFundCreated(indexed address,address,address,indexed address,string,indexed address,uint256,bytes,bytes)',
          'ReleaseStatusSet(indexed uint8,indexed uint8)',
          'VaultCallDeregistered(indexed address,bytes4)',
          'VaultCallRegistered(indexed address,bytes4)',
        ],
      },
      {
        name: 'FeeManager',
        block: variables.block,
        address: release.feeManagerAddress,
        events: [
          'AllSharesOutstandingForcePaidForFund(indexed address,address,uint256)',
          'FeeDeregistered(indexed address,indexed string)',
          'FeeEnabledForFund(indexed address,indexed address,bytes)',
          'FeeRegistered(indexed address,indexed string,uint8[],uint8[],bool,bool)',
          'FeeSettledForFund(indexed address,indexed address,indexed uint8,address,address,uint256)',
          'FeesRecipientSetForFund(indexed address,address,address)',
          'SharesOutstandingPaidForFund(indexed address,indexed address,uint256)',
        ],
      },
      {
        name: 'EntranceRateDirectFee',
        block: variables.block,
        address: release.entranceRateDirectFeeAddress,
        events: ['FundSettingsAdded(indexed address,uint256)', 'Settled(indexed address,indexed address,uint256)'],
      },
      {
        name: 'EntranceRateBurnFee',
        block: variables.block,
        address: release.entranceRateBurnFeeAddress,
        events: ['FundSettingsAdded(indexed address,uint256)', 'Settled(indexed address,indexed address,uint256)'],
      },
      {
        name: 'ManagementFee',
        block: variables.block,
        address: release.managementFeeAddress,
        events: ['FundSettingsAdded(indexed address,uint256)', 'Settled(indexed address,uint256,uint256)'],
      },
      {
        name: 'PerformanceFee',
        block: variables.block,
        address: release.performanceFeeAddress,
        events: [
          'ActivatedForFund(indexed address,uint256)',
          'FundSettingsAdded(indexed address,uint256,uint256)',
          'LastSharePriceUpdated(indexed address,uint256,uint256)',
          'PaidOut(indexed address,uint256,uint256,uint256)',
          'PerformanceUpdated(indexed address,uint256,uint256,int256)',
        ],
      },
      {
        name: 'IntegrationManager',
        block: variables.block,
        address: release.integrationManagerAddress,
        events: [
          'AdapterDeregistered(indexed address,indexed string)',
          'AdapterRegistered(indexed address,indexed string)',
          'AuthUserAddedForFund(indexed address,indexed address)',
          'AuthUserRemovedForFund(indexed address,indexed address)',
          'CallOnIntegrationExecutedForFund(indexed address,address,address,indexed address,indexed bytes4,bytes,address[],uint256[],address[],uint256[])',
        ],
      },
      {
        name: 'PolicyManager',
        block: variables.block,
        address: release.policyManagerAddress,
        events: [
          'PolicyDeregistered(indexed address,indexed string)',
          'PolicyDisabledForFund(indexed address,indexed address)',
          'PolicyEnabledForFund(indexed address,indexed address,bytes)',
          'PolicyRegistered(indexed address,indexed string,uint8[])',
        ],
      },
      {
        name: 'AdapterBlacklist',
        block: variables.block,
        address: release.adapterBlacklistAddress,
        events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
      },
      {
        name: 'AdapterWhitelist',
        block: variables.block,
        address: release.adapterWhitelistAddress,
        events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
      },
      {
        name: 'AssetBlacklist',
        block: variables.block,
        address: release.assetBlacklistAddress,
        events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
      },
      {
        name: 'AssetWhitelist',
        block: variables.block,
        address: release.assetWhitelistAddress,
        events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
      },
      {
        name: 'GuaranteedRedemption',
        block: variables.block,
        address: release.guaranteedRedemptionAddress,
        events: [
          'AdapterAdded(address)',
          'AdapterRemoved(address)',
          'FundSettingsSet(indexed address,uint256,uint256)',
          'RedemptionWindowBufferSet(uint256,uint256)',
        ],
      },
      {
        name: 'InvestorWhitelist',
        block: variables.block,
        address: release.investorWhitelistAddress,
        events: ['AddressesAdded(indexed address,address[])', 'AddressesRemoved(indexed address,address[])'],
      },
      {
        name: 'MaxConcentration',
        block: variables.block,
        address: release.maxConcentrationAddress,
        events: ['MaxConcentrationSet(indexed address,uint256)'],
      },
      {
        name: 'MinMaxInvestment',
        block: variables.block,
        address: release.minMaxInvestmentAddress,
        events: ['FundSettingsSet(indexed address,uint256,uint256)'],
      },
      {
        name: 'AggregatedDerivativePriceFeed',
        block: variables.block,
        address: release.aggregatedDerivativePriceFeedAddress,
        events: [
          'DerivativeAdded(indexed address,address)',
          'DerivativeRemoved(indexed address)',
          'DerivativeUpdated(indexed address,address,address)',
        ],
      },
      {
        name: 'ChainlinkPriceFeed',
        block: variables.block,
        address: release.chainlinkPriceFeedAddress,
        events: [
          'EthUsdAggregatorSet(address,address)',
          'PrimitiveAdded(indexed address,address,uint8,uint256)',
          'PrimitiveRemoved(indexed address)',
          'PrimitiveUpdated(indexed address,address,address)',
        ],
      },
    ])
    .map((release, index) => release.map((source) => ({ ...source, suffix: `${index}` })));

  const sources = [dispatcher, ...releases[0], ...releases[1]].map((options) => source(options));
  const templates = [
    template('VaultLib', [
      'AccessorSet(address,address)',
      'Approval(indexed address,indexed address,uint256)',
      'AssetWithdrawn(indexed address,indexed address,uint256)',
      'MigratorSet(address,address)',
      'OwnerSet(address,address)',
      'TrackedAssetAdded(address)',
      'TrackedAssetRemoved(address)',
      'Transfer(indexed address,indexed address,uint256)',
      'VaultLibSet(address,address)',
    ]),
    template('ComptrollerLib', [
      'MigratedSharesDuePaid(uint256)',
      'OverridePauseSet(indexed bool)',
      'PreRedeemSharesHookFailed(bytes,address,uint256)',
      'SharesBought(indexed address,indexed address,uint256,uint256,uint256)',
      'SharesRedeemed(indexed address,uint256,address[],uint256[])',
      'VaultProxySet(address)',
    ]),
  ];

  return { abis, sources, templates };
};
