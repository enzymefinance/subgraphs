#!/usr/bin/env node

process.on('SIGINT', () => {
  process.exit();
});

process.on('SIGTERM', () => {
  process.exit();
});

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    esModuleInterop: true,
  },
});

require('./script');
