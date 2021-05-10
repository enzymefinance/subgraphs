#!/usr/bin/env node

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    esModuleInterop: true,
  },
});

require('./script');
