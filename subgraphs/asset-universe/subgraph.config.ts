import {
  Configurator,
  Contexts,
  DataSourceUserDeclaration,
  SdkUserDeclaration,
  Template,
} from '@enzymefinance/subgraph-cli';

import ethereum from '@enzymefinance/environment/ethereum';
import polygon from '@enzymefinance/environment/polygon';

interface Variables {
  wethTokenAddress: string;
  startBlock: number;
  releaseConfiguration: {
    v2?: {
      fundDeployer: string;
      derivativePriceFeed: string;
      primitivePriceFeed: string;
    };
    v3?: {
      fundDeployer: string;
      derivativePriceFeed: string;
      primitivePriceFeed: string;
    };
    v4?: {
      fundDeployer: string;
      valueInterpreter: string;
    };
  };
  testnetConfiguration?: {
    treasuryController: string;
  };
}

const name = 'enzymefinance/asset-universe';

const mainnet: Variables = {
  wethTokenAddress: ethereum.weth.id,
  startBlock: 11636534,
  releaseConfiguration: {
    v2: {
      fundDeployer: '0x9134c9975244b46692ad9a7da36dba8734ec6da3',
      derivativePriceFeed: '0xcfb6f4c08856986d13839b1907b5c645ee95388f',
      primitivePriceFeed: '0xfb3a9655f5fea18cac92021e83550f829ae6f7f7',
    },
    v3: {
      fundDeployer: '0x7e6d3b1161df9c9c7527f68d651b297d2fdb820b',
      derivativePriceFeed: '0x2e45f9b3fd5871ccaf4eb415dfccbdd126f57c4f',
      primitivePriceFeed: '0x1fad8faf11e027f8630f394599830dbeb97004ee',
    },
    v4: {
      fundDeployer: ethereum.contracts.FundDeployer,
      valueInterpreter: ethereum.contracts.ValueInterpreter,
    },
  },
};

const matic: Variables = {
  wethTokenAddress: polygon.weth.id,
  startBlock: 25731749,
  releaseConfiguration: {
    v4: {
      fundDeployer: polygon.contracts.FundDeployer,
      valueInterpreter: polygon.contracts.ValueInterpreter,
    },
  },
};

const kovan: Variables = {
  wethTokenAddress: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  startBlock: 28110115,
  releaseConfiguration: {
    v4: {
      fundDeployer: '0xdc7fcff86385a86a9bb29472c9165f77b96ddac8',
      valueInterpreter: '0xd62f44b640ffa7e99cb2e3eebac22a90c326d88d',
    },
  },
  testnetConfiguration: {
    treasuryController: '0x2546e91c90922f05426b7f016263147d3cd67b4c',
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
  matic: {
    name: `${name}-matic`,
    network: 'matic',
    variables: matic,
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
      block: variables.startBlock,
      events: (abi) => [abi.getEvent('DerivativeAdded'), abi.getEvent('DerivativeRemoved')],
    });

    sources.push({
      name: 'ChainlinkPriceFeed',
      version: 2,
      address: variables.releaseConfiguration.v2.primitivePriceFeed,
      block: variables.startBlock,
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
      block: variables.startBlock,
      events: (abi) => [abi.getEvent('DerivativeAdded'), abi.getEvent('DerivativeRemoved')],
    });

    sources.push({
      name: 'ChainlinkPriceFeed',
      version: 3,
      address: variables.releaseConfiguration.v3.primitivePriceFeed,
      block: variables.startBlock,
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
      block: variables.startBlock,
      events: (abi) => [
        abi.getEvent('DerivativeAdded'),
        abi.getEvent('DerivativeRemoved'),
        abi.getEvent('PrimitiveAdded'),
        abi.getEvent('PrimitiveRemoved'),
      ],
    });
  }

  return { sdks, sources };
};
