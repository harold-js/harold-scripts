#!/usr/bin/env node

const spawn = require('cross-spawn');

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
