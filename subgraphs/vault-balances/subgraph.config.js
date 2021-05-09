const path = require('path');
const protocol = path.join(path.dirname(require.resolve('@enzymefinance/protocol/package.json')), 'artifacts');

function artifact(name) {
  return path.relative(__dirname, path.join(protocol, `${name}.json`));
}

const contexts = {
  local: {
    local: true,
    name: 'enzymefinance/vault-balances',
    node: 'http://127.0.0.1:8020/',
    ipfs: 'http://localhost:5001/',
    network: 'kovan',
    block: 24710049,
  },
  kovan: {
    local: false,
    name: 'enzymefinance/vault-balances-kovan',
    node: 'https://api.thegraph.com/deploy/',
    ipfs: 'https://api.thegraph.com/ipfs/',
    network: 'kovan',
    block: 24710049,
  },
  mainnet: {
    local: false,
    name: 'enzymefinance/vault-balances',
    node: 'https://api.thegraph.com/deploy/',
    ipfs: 'https://api.thegraph.com/ipfs/',
    network: 'mainnet',
    block: 11636493,
  },
};

module.exports = (context, abis) => {
  const config = contexts[context];
  if (!config) {
    throw new Error('Invalid context');
  }

  return {
    local: config.local,
    name: config.name,
    node: config.node,
    ipfs: config.ipfs,
    network: config.network,
    sources: [
      {
        name: 'Dispatcher',
        file: './mappings/Dispatcher.ts',
        block: config.block,
        abi: artifact('Dispatcher'),
        events: [
          {
            event: 'VaultProxyDeployed(indexed address,indexed address,address,indexed address,address,string)',
            handler: 'handleVaultProxyDeployed',
          },
        ],
      },
      {
        name: 'ERC20',
        file: './mappings/Asset.ts',
        block: config.block,
        abis,
        events: [
          {
            event: 'Transfer(indexed address,indexed address,uint256)',
            handler: 'handleTransfer',
          },
        ],
      },
    ],
  };
};
