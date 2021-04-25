const fse = require('fs-extra');
const config = require('./constants');

module.exports = () => {
  fse.emptyDirSync(config.publicDirName);
  fse.ensureDirSync(`${config.publicDirName}/${config.postsDirName}`);
  fse.ensureDirSync(`${config.publicDirName}/${config.assetsDirName}`);
  fse.ensureDirSync(`${config.publicDirName}/${config.jsonDataDirName}`);
};
