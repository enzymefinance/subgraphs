import { Configurator, Contexts, Template } from '@enzymefinance/subgraph-cli';

interface Variables {
  aggregatedDerivativePriceFeed: string;
  aggregatedDerivativePriceFeedBlock: number;
  chainlinkPriceFeed: string;
  chainlinkPriceFeedBlock: number;
  currencyAggregatorProxies: {
    USD: string;
    BTC: string;
    EUR: string;
    CHF: string;
    GBP: string;
    AUD: string;
    JPY: string;
  };
}

const name = 'enzymefinance/asset-prices';

const mainnet: Variables = {
  aggregatedDerivativePriceFeed: '0xCFb6F4C08856986d13839B1907b5c645EE95388F',
  aggregatedDerivativePriceFeedBlock: 11636552,
  chainlinkPriceFeed: '0xfB3A9655F5feA18caC92021E83550F829ae6F7F7',
  chainlinkPriceFeedBlock: 11636534,
  currencyAggregatorProxies: {
    USD: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    BTC: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    EUR: '0xb49f677943BC038e9857d61E7d053CaA2C1734C1',
    CHF: '0x449d117117838fFA61263B61dA6301AA2a88B13A',
    GBP: '0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5',
    AUD: '0x77F9710E7d0A19669A13c055F62cd80d313dF022',
    JPY: '0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3',
  },
};

const kovan: Variables = {
  aggregatedDerivativePriceFeed: '0x1899F9e144A0D47cC1471e797C2b7930adf530b3',
  aggregatedDerivativePriceFeedBlock: 24710069,
  chainlinkPriceFeed: '0x1dbf40Fc502A61a09c38F5D0f4D07f42AC507606',
  chainlinkPriceFeedBlock: 24710056,
  currencyAggregatorProxies: {
    USD: '0x9326BFA02ADD2366b30bacB125260Af641031331',
    BTC: '0x6135b13325bfC4B00278B4abC5e20bbce2D6580e',
    EUR: '0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13',
    CHF: '0xed0616BeF04D374969f302a34AE4A63882490A8C',
    GBP: '0x28b0061f44E6A9780224AA61BEc8C3Fcb0d37de9',
    AUD: '0x5813A90f826e16dB392abd2aF7966313fc1fd5B8',
    JPY: '0xD627B1eF3AC23F1d3e576FA6206126F3c1Bd0942',
  },
};

export const contexts: Contexts<Variables> = {
  local: {
    name,
    local: true,
    network: 'kovan',
    variables: kovan,
  },
  'mainnet:dev': {
    name,
    local: true,
    network: 'mainnet',
    variables: mainnet,
  },
  mainnet: {
    name,
    network: 'mainnet',
    variables: mainnet,
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
      contract: 'AggregatedDerivativePriceFeed',
      address: variables.aggregatedDerivativePriceFeed,
      block: variables.aggregatedDerivativePriceFeedBlock,
      events: [
        'DerivativeAdded(indexed address,address)',
        'DerivativeUpdated(indexed address,address,address)',
        'DerivativeRemoved(indexed address)',
      ],
    },
    {
      name: 'ChainlinkPriceFeed',
      contract: 'ChainlinkPriceFeed',
      address: variables.chainlinkPriceFeed,
      block: variables.chainlinkPriceFeedBlock,
      events: [
        'PrimitiveAdded(indexed address,address,uint8,uint256)',
        'PrimitiveUpdated(indexed address,address,address)',
        'PrimitiveRemoved(indexed address)',
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
