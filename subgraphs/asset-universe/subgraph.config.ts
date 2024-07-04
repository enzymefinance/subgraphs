import {
  Configurator,
  Contexts,
  DataSourceUserDeclaration,
  SdkUserDeclaration,
  Template,
} from '@enzymefinance/subgraph-cli';
import { getEnvironment } from '@enzymefinance/environment/all';
import { Deployment, Version } from '@enzymefinance/environment';

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

const name = 'enzyme-asset-universe';

const deployments = {
  ethereum: getEnvironment(Deployment.ETHEREUM, Version.SULU),
  polygon: getEnvironment(Deployment.POLYGON, Version.SULU),
  testnet: getEnvironment(Deployment.TESTNET, Version.SULU),
};

const ethereum: Variables = {
  wethTokenAddress: deployments.ethereum.namedTokens.weth.id,
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
      fundDeployer: deployments.ethereum.contracts.FundDeployer,
      valueInterpreter: deployments.ethereum.contracts.ValueInterpreter,
    },
  },
};

const arbitrum: Variables = {
  wethTokenAddress: '0x0000000000000000000000000000000000000000',
  startBlock: 1,
  releaseConfiguration: {
    v4: {
      fundDeployer: '0x0000000000000000000000000000000000000000',
      valueInterpreter: '0x0000000000000000000000000000000000000000',
    },
  },
};

const polygon: Variables = {
  wethTokenAddress: deployments.polygon.namedTokens.weth.id,
  startBlock: 25825424,
  releaseConfiguration: {
    v4: {
      fundDeployer: deployments.polygon.contracts.FundDeployer,
      valueInterpreter: deployments.polygon.contracts.ValueInterpreter,
    },
  },
};

const testnet: Variables = {
  wethTokenAddress: deployments.testnet.namedTokens.weth.id,
  startBlock: 25731749,
  releaseConfiguration: {
    v4: {
      fundDeployer: deployments.testnet.contracts.FundDeployer,
      valueInterpreter: deployments.testnet.contracts.ValueInterpreter,
    },
  },
};

export const contexts: Contexts<Variables> = {
  arbitrum: {
    name: `${name}-arbitrum`,
    network: 'arbitrum-one',
    variables: arbitrum,
  },
  ethereum: {
    name,
    network: 'mainnet',
    variables: ethereum,
  },
  polygon: {
    name: `${name}-polygon`,
    network: 'matic',
    variables: polygon,
  },
  testnet: {
    name: `${name}-testnet`,
    network: 'matic',
    variables: testnet,
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
