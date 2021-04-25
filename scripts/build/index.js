const prepareDirectories = require('./prepare-dirs');
const copyAssets = require('./copy-assets');
const copyJSONData = require('./copy-json-data');
const build = require('./build');

// Prepare directories
prepareDirectories();

// Copy assets
copyAssets();

// Copy JSON data
copyJSONData();

// Build files
build();
