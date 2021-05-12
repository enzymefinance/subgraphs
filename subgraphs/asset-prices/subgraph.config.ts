import { Configurator, Contexts, Template } from '@enzymefinance/subgraph-cli';

interface Variables {
  aggregatedDerivativePriceFeed: string;
  aggregatedDerivativePriceFeedBlock: number;
  chainlinkPriceFeed: string;
  chainlinkPriceFeedBlock: number;
}

export const contexts: Contexts<Variables> = {
  local: {
    local: true,
    name: 'enzymefinance/asset-prices',
    network: 'kovan',
    variables: {
      aggregatedDerivativePriceFeed: '0x1899F9e144A0D47cC1471e797C2b7930adf530b3',
      aggregatedDerivativePriceFeedBlock: 24710069,
      chainlinkPriceFeed: '0x1dbf40Fc502A61a09c38F5D0f4D07f42AC507606',
      chainlinkPriceFeedBlock: 24710056,
    },
  },
  mainnet: {
    local: false,
    name: 'enzymefinance/asset-prices',
    network: 'mainnet',
    variables: {
      aggregatedDerivativePriceFeed: '0xCFb6F4C08856986d13839B1907b5c645EE95388F',
      aggregatedDerivativePriceFeedBlock: 11636552,
      chainlinkPriceFeed: '0xfB3A9655F5feA18caC92021E83550F829ae6F7F7',
      chainlinkPriceFeedBlock: 11636534,
    },
  },
};

export const templates: Template[] = [
  {
    template: 'templates/addresses.ts',
    destination: 'generated/addresses.ts',
  },
];

export const configure: Configurator<Variables> = (variables: Variables) => {
  const abis = [
    '@chainlink/contracts/abi/v0.6/AggregatorInterface.json',
    '@chainlink/contracts/abi/v0.6/AggregatorProxy.json',
    '@enzymefinance/protocol/artifacts/AggregatedDerivativePriceFeed.json',
    '@enzymefinance/protocol/artifacts/ChainlinkPriceFeed.json',
    '@enzymefinance/protocol/artifacts/ValueInterpreter.json',
  ];

  const sources = [
    {
      name: 'AggregatedDerivativePriceFeed',
      address: variables.aggregatedDerivativePriceFeed,
      block: variables.aggregatedDerivativePriceFeedBlock,
      events: [
        'DerivativeAdded(indexed address,address)',
        'DerivativeRemoved(indexed address)',
        'DerivativeUpdated(indexed address,address,address)',
      ],
    },
    {
      name: 'ChainlinkPriceFeed',
      address: variables.chainlinkPriceFeed,
      block: variables.chainlinkPriceFeedBlock,
      events: [
        'PrimitiveAdded(indexed address,address,uint8,uint256)',
        'PrimitiveRemoved(indexed address)',
        'PrimitiveUpdated(indexed address,address,address)',
      ],
    },
  ];

  const templates = [
    {
      name: 'ChainlinkAggregator',
      abi: 'AggregatorInterfaceContract',
      events: ['AnswerUpdated(indexed int256,indexed uint256,uint256)'],
    },
  ];

  return { abis, sources, templates };
};
