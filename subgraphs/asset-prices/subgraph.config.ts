import { Configurator, Contexts, DataSourceDeclarationLike, Template } from '@enzymefinance/subgraph-cli';

interface Variables {
  releaseConfiguration: {
    v2?: {
      valueInterpreter: string;
      derivativePriceFeed: string;
      derivativePriceFeedBlock: number;
      primitivePriceFeed: string;
      primitivePriceFeedBlock: number;
    };
    v3?: {
      valueInterpreter: string;
      derivativePriceFeed: string;
      derivativePriceFeedBlock: number;
      primitivePriceFeed: string;
      primitivePriceFeedBlock: number;
    };
    v4?: {
      valueInterpreter: string;
      valueInterpreterBlock: number;
    };
  };
  testnetConfiguration?: {
    treasuryController: string;
    treasuryControllerBlock: number;
  };
  currencyAggregatorProxies: {
    USD: string;
    BTC: string;
    EUR: string;
    CHF: string;
    GBP: string;
    AUD: string;
    JPY: string;
  };
  wethToken: string;
}

const name = 'enzymefinance/asset-prices';

const mainnet: Variables = {
  releaseConfiguration: {
    v2: {
      valueInterpreter: '0x6618bF56E1C7b6c8310Bfe4096013bEd8F191628',
      derivativePriceFeed: '0xCFb6F4C08856986d13839B1907b5c645EE95388F',
      derivativePriceFeedBlock: 11636552,
      primitivePriceFeed: '0xfB3A9655F5feA18caC92021E83550F829ae6F7F7',
      primitivePriceFeedBlock: 11636534,
    },
    v3: {
      valueInterpreter: '0x10a5624840Ac07287f756777DF1DEC34d2C2d654',
      derivativePriceFeed: '0x2E45f9B3fd5871cCaf4eB415dFCcbDD126F57C4f',
      derivativePriceFeedBlock: 12388007,
      primitivePriceFeed: '0x1fad8faf11E027f8630F394599830dBeb97004EE',
      primitivePriceFeedBlock: 12387843,
    },
    // TODO: Add v4 contracts.
  },
  currencyAggregatorProxies: {
    USD: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    BTC: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    EUR: '0xb49f677943BC038e9857d61E7d053CaA2C1734C1',
    CHF: '0x449d117117838fFA61263B61dA6301AA2a88B13A',
    GBP: '0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5',
    AUD: '0x77F9710E7d0A19669A13c055F62cd80d313dF022',
    JPY: '0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3',
  },
  wethToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
};

const kovan: Variables = {
  releaseConfiguration: {
    // v2: {
    //   valueInterpreter: '0xFEE7aEE3907d1657fd2BdcBba8909AF40a144421',
    //   derivativePriceFeed: '0x1899F9e144A0D47cC1471e797C2b7930adf530b3',
    //   derivativePriceFeedBlock: 24710069,
    //   primitivePriceFeed: '0x1dbf40Fc502A61a09c38F5D0f4D07f42AC507606',
    //   primitivePriceFeedBlock: 24710056,
    // },
    // v3: {
    //   valueInterpreter: '0x92D1D329de7633B788bD4A9727192C2F498e2cA7',
    //   derivativePriceFeed: '0x5304c3f2c2433e5e37732B46604eEB39725a4883',
    //   derivativePriceFeedBlock: 24710610,
    //   primitivePriceFeed: '0x5A49D2a6420362bE3E396C59Fe9280c9f9588Ec3',
    //   primitivePriceFeedBlock: 24710598,
    // },
    // // TODO: Add v4 contracts.
  },
  testnetConfiguration: {
    treasuryController: '0x50765658E2cFFBF4196D9fdA114c917953e5cCc9',
    treasuryControllerBlock: 27096029,
  },
  currencyAggregatorProxies: {
    USD: '0x9326BFA02ADD2366b30bacB125260Af641031331',
    BTC: '0x6135b13325bfC4B00278B4abC5e20bbce2D6580e',
    EUR: '0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13',
    CHF: '0xed0616BeF04D374969f302a34AE4A63882490A8C',
    GBP: '0x28b0061f44E6A9780224AA61BEc8C3Fcb0d37de9',
    AUD: '0x5813A90f826e16dB392abd2aF7966313fc1fd5B8',
    JPY: '0xD627B1eF3AC23F1d3e576FA6206126F3c1Bd0942',
  },
  wethToken: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
};

export const contexts: Contexts<Variables> = {
  kovan: {
    name: `${name}-kovan`,
    network: 'kovan',
    variables: kovan,
  },
  mainnet: {
    name,
    network: 'mainnet',
    variables: mainnet,
  },
  local: {
    name,
    local: true,
    network: 'mainnet',
    variables: mainnet,
  },
};

export const templates: Template[] = [
  {
    template: 'templates/configuration.ts',
    destination: 'generated/configuration.ts',
  },
];

export const configure: Configurator<Variables> = (variables: Variables) => {
  const abis = [
    '@chainlink/contracts/abi/v0.6/AggregatorInterface.json',
    '@chainlink/contracts/abi/v0.6/AggregatorProxy.json',
    './abis/DerivativePriceFeed.json',
    './abis/PrimitivePriceFeed.json',
    './abis/CombinedPriceFeed.json',
    './abis/ValueInterpreter.json',
    './abis/ValueInterpreterLegacy.json',
    './abis/TestnetTreasuryController.json',
  ];

  const sources: DataSourceDeclarationLike[] = [];

  if (variables.releaseConfiguration.v2) {
    sources.push({
      abi: 'DerivativePriceFeedContract',
      name: 'DerivativePriceFeed',
      version: '2',
      address: variables.releaseConfiguration.v2.derivativePriceFeed,
      block: variables.releaseConfiguration.v2.derivativePriceFeedBlock,
      events: [
        {
          event: 'DerivativeAdded(indexed address,address)',
          handler: 'handleDerivativeAdded',
        },
        {
          event: 'DerivativeRemoved(indexed address)',
          handler: 'handleDerivativeRemoved',
        },
      ],
    });

    sources.push({
      abi: 'PrimitivePriceFeedContract',
      name: 'PrimitivePriceFeed',
      version: '2',
      address: variables.releaseConfiguration.v2.primitivePriceFeed,
      block: variables.releaseConfiguration.v2.primitivePriceFeedBlock,
      events: [
        {
          event: 'PrimitiveAdded(indexed address,address,uint8,uint256)',
          handler: 'handlePrimitiveAdded',
        },
        {
          event: 'PrimitiveUpdated(indexed address,address,address)',
          handler: 'handlePrimitiveUpdated',
        },
        {
          event: 'PrimitiveRemoved(indexed address)',
          handler: 'handlePrimitiveRemoved',
        },
        {
          event: 'StalePrimitiveRemoved(indexed address)',
          handler: 'handleStalePrimitiveRemoved',
        },
      ],
    });
  }

  if (variables.releaseConfiguration.v3) {
    sources.push({
      abi: 'DerivativePriceFeedContract',
      name: 'DerivativePriceFeed',
      version: '3',
      address: variables.releaseConfiguration.v3.derivativePriceFeed,
      block: variables.releaseConfiguration.v3.derivativePriceFeedBlock,
      events: [
        {
          event: 'DerivativeAdded(indexed address,address)',
          handler: 'handleDerivativeAdded',
        },
        {
          event: 'DerivativeRemoved(indexed address)',
          handler: 'handleDerivativeRemoved',
        },
      ],
    });

    sources.push({
      abi: 'PrimitivePriceFeedContract',
      name: 'PrimitivePriceFeed',
      version: '3',
      address: variables.releaseConfiguration.v3.primitivePriceFeed,
      block: variables.releaseConfiguration.v3.primitivePriceFeedBlock,
      events: [
        {
          event: 'PrimitiveAdded(indexed address,address,uint8,uint256)',
          handler: 'handlePrimitiveAdded',
        },
        {
          event: 'PrimitiveUpdated(indexed address,address,address)',
          handler: 'handlePrimitiveUpdated',
        },
        {
          event: 'PrimitiveRemoved(indexed address)',
          handler: 'handlePrimitiveRemoved',
        },
        {
          event: 'StalePrimitiveRemoved(indexed address)',
          handler: 'handleStalePrimitiveRemoved',
        },
      ],
    });
  }

  if (variables.releaseConfiguration.v4) {
    sources.push({
      abi: 'CombinedPriceFeedContract',
      name: 'CombinedPriceFeed',
      version: '4',
      address: variables.releaseConfiguration.v4.valueInterpreter,
      block: variables.releaseConfiguration.v4.valueInterpreterBlock,
      events: [
        {
          event: 'DerivativeAdded(indexed address,address)',
          handler: 'handleDerivativeAdded',
        },
        {
          event: 'DerivativeRemoved(indexed address)',
          handler: 'handleDerivativeRemoved',
        },
        {
          event: 'PrimitiveAdded(indexed address,address,uint8,uint256)',
          handler: 'handlePrimitiveAdded',
        },
        {
          event: 'PrimitiveRemoved(indexed address)',
          handler: 'handlePrimitiveRemoved',
        },
        {
          event: 'StalePrimitiveRemoved(indexed address)',
          handler: 'handleStalePrimitiveRemoved',
        },
      ],
    });
  }

  if (variables.testnetConfiguration) {
    sources.push({
      abi: 'TestnetTreasuryControllerContract',
      name: 'TestnetTreasuryController',
      address: variables.testnetConfiguration.treasuryController,
      block: variables.testnetConfiguration.treasuryControllerBlock,
      events: [
        {
          event: 'TokenDeployed(indexed address,string,string,uint8)',
          handler: 'handleTokenDeployed',
        },
        {
          event: 'PriceUpdated(indexed address,uint256)',
          handler: 'handlePriceUpdated',
        },
      ],
    });
  }

  const templates = [
    {
      name: 'ChainlinkAggregator',
      abi: 'AggregatorInterfaceContract',
      events: ['AnswerUpdated(indexed int256,indexed uint256,uint256)'],
    },
  ];

  return { abis, sources, templates };
};
