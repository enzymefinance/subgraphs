#!/usr/bin/env tsx

import '../src';

process.on('SIGINT', () => {
  process.exit();
});

process.on('SIGTERM', () => {
  process.exit();
});
