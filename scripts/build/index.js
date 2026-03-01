import chalk from 'chalk';
import prepareDirectories from './prepare-dirs.js';
import copyAssets from './copy-assets.js';
import copyJSONData from './copy-json-data.js';
import copyStatics from './copy-statics.js';
import build from './build.js';

// Main build process
(async () => {
  // Prepare directories
  prepareDirectories();

  // Copy assets
  copyAssets();

  // Build files
  await build();

  // Copy JSON data
  copyJSONData();

  // Copy statics
  copyStatics();

  process.stdout.write(`\r\x1b[K${chalk.green('Ready.')}\n`);
})();
