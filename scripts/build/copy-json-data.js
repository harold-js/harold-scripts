const fse = require('fs-extra');
const config = require('./constants');

module.exports = () => {
  fse.removeSync(`${config.publicDirName}/${config.jsonDataDirName}`);
  fse.copySync(
    `${config.srcDirName}/${config.jsonDataDirName}`,
    `${config.publicDirName}/${config.jsonDataDirName}`
  );
};
