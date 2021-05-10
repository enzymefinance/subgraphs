import { Configurator } from '@enzymefinance/subgraph-cli';

interface Variables {
  block: number;
  dispatcher: string;
}

export default (configure: Configurator<Variables>) =>
  configure(
    {
      local: {
        local: true,
        name: 'enzymefinance/vault-balances',
        network: 'kovan',
        variables: {
          dispatcher: '0xba9493530494958EC2DeED9c8BB34004ff37Ad28',
          block: 24710049,
        },
      },
      kovan: {
        name: 'enzymefinance/vault-balances-kovan',
        network: 'kovan',
        variables: {
          dispatcher: '0xba9493530494958EC2DeED9c8BB34004ff37Ad28',
          block: 24710049,
        },
      },
      mainnet: {
        name: 'enzymefinance/vault-balances',
        network: 'mainnet',
        variables: {
          dispatcher: '0xC3DC853dD716bd5754f421ef94fdCbac3902ab32',
          block: 11636493,
        },
      },
    },
    (variables) => ({
      abis: [
        {
          name: 'DispatcherContract',
          file: '@enzymefinance/protocol/artifacts/Dispatcher.json',
        },
      ],
      sources: [
        {
          name: 'Dispatcher',
          abi: 'DispatcherContract',
          block: variables.block,
          address: variables.dispatcher,
          file: './mappings/Dispatcher.ts',
          events: [
            {
              event: 'VaultProxyDeployed(indexed address,indexed address,address,indexed address,address,string)',
              handler: 'handleVaultProxyDeployed',
            },
          ],
        },
        {
          name: 'ERC20',
          abi: 'ERC20Contract',
          block: variables.block,
          file: './mappings/Asset.ts',
          events: [
            {
              event: 'Transfer(indexed address,indexed address,uint256)',
              handler: 'handleTransfer',
            },
          ],
        },
      ],
    }),
  );
