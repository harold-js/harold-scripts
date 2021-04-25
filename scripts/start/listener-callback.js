const p = require('path');
const fse = require('fs-extra');
const build = require('../build/build');
const copyAssets = require('../build/copy-assets');
const copyJSONData = require('../build/copy-json-data');
const config = require('../build/constants');

// Operations for file changes listener
module.exports = (event, path) => {
  build();
  if (path.includes(`${config.srcDirName}/${config.assetsDirName}`)) {
    copyAssets();
  }
  if (path.includes(`${config.srcDirName}/${config.postsDirName}`)) {
    copyJSONData();
  }
  if (
    path.includes(`${config.srcDirName}/${config.pagesDirName}`) &&
    event === 'unlink'
  ) {
    const pathSplit = path.split('/');
    const fileNameHbs = pathSplit[pathSplit.length - 1];
    const filenameHtml = `${p.parse(fileNameHbs).name}.html`;
    const publicFilePath = `${config.publicDirName}/${filenameHtml}`;
    fse.removeSync(publicFilePath);
  }
  console.log(`${event}: ${path}`);
};
