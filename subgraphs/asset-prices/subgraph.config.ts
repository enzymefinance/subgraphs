import { AbiDeclaration, Configurator, Contexts, DataSourceDeclaration, Template } from '@enzymefinance/subgraph-cli';

interface Variables {
  aggregatedDerivativePriceFeed: string;
}

export const contexts: Contexts<Variables> = {
  local: {
    local: true,
    name: 'enzymefinance/vault-balances',
    network: 'kovan',
    variables: {
      aggregatedDerivativePriceFeed: '0xba9493530494958EC2DeED9c8BB34004ff37Ad28',
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
  const abis: AbiDeclaration[] = [
    {
      name: 'AggregatedDerivativePriceFeedContract',
      file: '@enzymefinance/protocol/artifacts/AggregatedDerivativePriceFeed.json',
    },
  ];

  const sources: DataSourceDeclaration[] = [
    {
      name: 'AggregatedDerivativePriceFeed',
      abi: 'AggregatedDerivativePriceFeedContract',
      file: 'mappings/AggregatedDerivativePriceFeed.ts',
      address: variables.aggregatedDerivativePriceFeed,
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
          event: 'DerivativeUpdated(indexed address,address,address)',
          handler: 'handleDerivativeUpdated',
        },
      ],
    },
  ];

  return { abis, sources };
};
