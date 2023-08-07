import prepareDirectories from './prepare-dirs.js';
import copyAssets from './copy-assets.js';
import copyJSONData from './copy-json-data.js';
import copyStatics from './copy-statics.js';
import build from './build.js';

// Prepare directories
prepareDirectories();

// Copy assets
copyAssets();

// Build files
build();

// Copy JSON data
copyJSONData();

// Copy statics
copyStatics();
