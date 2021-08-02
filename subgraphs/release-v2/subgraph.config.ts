import { Configurator, Contexts } from '@enzymefinance/subgraph-cli';

interface Variables {
  // TODO
}

const name = 'enzymefinance/release-v2';

export const contexts: Contexts<Variables> = {};

export const configure: Configurator<Variables> = (variables) => ({
  abis: [],
  sources: [],
  templates: [],
});
