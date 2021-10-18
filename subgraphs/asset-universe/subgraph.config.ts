import {
  Configurator,
  Contexts,
  DataSourceUserDeclaration,
  SdkUserDeclaration,
  Template,
} from '@enzymefinance/subgraph-cli';

interface Variables {
  releaseConfiguration: {
    v2?: {
      fundDeployer: string;
      derivativePriceFeed: string;
      derivativePriceFeedBlock: number;
      primitivePriceFeed: string;
      primitivePriceFeedBlock: number;
    };
    v3?: {
      fundDeployer: string;
      derivativePriceFeed: string;
      derivativePriceFeedBlock: number;
      primitivePriceFeed: string;
      primitivePriceFeedBlock: number;
    };
    v4?: {
      fundDeployer: string;
      valueInterpreter: string;
      valueInterpreterBlock: number;
    };
  };
  testnetConfiguration?: {
    treasuryController: string;
    treasuryControllerBlock: number;
  };
}

const name = 'enzymefinance/asset-universe';

const mainnet: Variables = {
  releaseConfiguration: {
    v2: {
      fundDeployer: '0x9134C9975244b46692Ad9A7Da36DBa8734Ec6DA3',
      derivativePriceFeed: '0xCFb6F4C08856986d13839B1907b5c645EE95388F',
      derivativePriceFeedBlock: 11636552,
      primitivePriceFeed: '0xfB3A9655F5feA18caC92021E83550F829ae6F7F7',
      primitivePriceFeedBlock: 11636534,
    },
    v3: {
      fundDeployer: '0x7e6d3b1161DF9c9c7527F68d651B297d2Fdb820B',
      derivativePriceFeed: '0x2E45f9B3fd5871cCaf4eB415dFCcbDD126F57C4f',
      derivativePriceFeedBlock: 12388007,
      primitivePriceFeed: '0x1fad8faf11E027f8630F394599830dBeb97004EE',
      primitivePriceFeedBlock: 12387843,
    },
  },
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
    treasuryController: '0xd5590aE02a9bD0011d15FdFea75b808A227bC383',
    treasuryControllerBlock: 27217130,
  },
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
  const sources: DataSourceUserDeclaration[] = [];
  const sdks: SdkUserDeclaration[] = [
    {
      name: 'ERC20',
      abis: {
        ERC20: 'abis/ERC20.json',
      },
      functions: (abis) => [
        abis.ERC20.getFunction('symbol'),
        abis.ERC20.getFunction('name'),
        abis.ERC20.getFunction('decimals'),
      ],
    },
    {
      name: 'ERC20Bytes',
      abis: {
        ERC20Bytes: 'abis/ERC20Bytes.json',
      },
      functions: (abis) => [abis.ERC20Bytes.getFunction('symbol'), abis.ERC20Bytes.getFunction('name')],
    },
  ];

  if (variables.releaseConfiguration.v2) {
    sources.push({
      name: 'AggregatedDerivativePriceFeed',
      version: 2,
      address: variables.releaseConfiguration.v2.derivativePriceFeed,
      block: variables.releaseConfiguration.v2.derivativePriceFeedBlock,
      events: (abi) => [abi.getEvent('DerivativeAdded'), abi.getEvent('DerivativeRemoved')],
    });

    sources.push({
      name: 'ChainlinkPriceFeed',
      version: 2,
      address: variables.releaseConfiguration.v2.primitivePriceFeed,
      block: variables.releaseConfiguration.v2.primitivePriceFeedBlock,
      events: (abi) => [
        abi.getEvent('PrimitiveAdded'),
        abi.getEvent('PrimitiveUpdated'),
        abi.getEvent('PrimitiveRemoved'),
        abi.getEvent('StalePrimitiveRemoved'),
      ],
    });
  }

  if (variables.releaseConfiguration.v3) {
    sources.push({
      name: 'AggregatedDerivativePriceFeed',
      version: 3,
      address: variables.releaseConfiguration.v3.derivativePriceFeed,
      block: variables.releaseConfiguration.v3.derivativePriceFeedBlock,
      events: (abi) => [abi.getEvent('DerivativeAdded'), abi.getEvent('DerivativeRemoved')],
    });

    sources.push({
      name: 'ChainlinkPriceFeed',
      version: 3,
      address: variables.releaseConfiguration.v3.primitivePriceFeed,
      block: variables.releaseConfiguration.v3.primitivePriceFeedBlock,
      events: (abi) => [
        abi.getEvent('PrimitiveAdded'),
        abi.getEvent('PrimitiveUpdated'),
        abi.getEvent('PrimitiveRemoved'),
        abi.getEvent('StalePrimitiveRemoved'),
      ],
    });
  }

  if (variables.releaseConfiguration.v4) {
    sources.push({
      name: 'ValueInterpreter',
      version: 4,
      address: variables.releaseConfiguration.v4.valueInterpreter,
      block: variables.releaseConfiguration.v4.valueInterpreterBlock,
      events: (abi) => [
        abi.getEvent('DerivativeAdded'),
        abi.getEvent('DerivativeRemoved'),
        abi.getEvent('PrimitiveAdded'),
        abi.getEvent('PrimitiveRemoved'),
        abi.getEvent('StalePrimitiveRemoved'),
      ],
    });
  }

  if (variables.testnetConfiguration) {
    sources.push({
      name: 'TestnetTreasuryController',
      address: variables.testnetConfiguration.treasuryController,
      block: variables.testnetConfiguration.treasuryControllerBlock,
      events: (abi) => [abi.getEvent('TokenDeployed')],
    });
  }

  return { sdks, sources };
};
