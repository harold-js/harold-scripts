#!/usr/bin/env node

import spawn from 'cross-spawn';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const args = process.argv;

const script = args ? args[2] : undefined;
const additionalArgs = args.slice(3);

if (script && ['start', 'build'].includes(script)) {
  const result = spawn.sync(
    'node',
    [require.resolve('../scripts/' + script), ...additionalArgs],
    { stdio: 'inherit' }
  );
  process.exit(result.status);
} else {
  console.log('Unknown script "' + script + '".');
}
