const fse = require('fs-extra');
const config = require('./constants');

module.exports = () => {
  fse.removeSync(`${config.publicDirName}/${config.assetsDirName}`);
  fse.copySync(
    `${config.srcDirName}/${config.assetsDirName}`,
    `${config.publicDirName}/${config.assetsDirName}`
  );
};
