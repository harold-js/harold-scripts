const prepareDirectories = require('./prepare-dirs');
const copyAssets = require('./copy-assets');
const copyJSONData = require('./copy-json-data');
const copyStatics = require('./copy-statics');
const build = require('./build');

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
