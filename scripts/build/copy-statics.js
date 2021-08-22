const fse = require('fs-extra');
const config = require('./constants');

module.exports = () => {
  if (fse.pathExistsSync(`${config.srcDirName}/${config.staticsDirName}`)) {
    fse.copySync(
      `${config.srcDirName}/${config.staticsDirName}`,
      `${config.publicDirName}`
    );
  }
};
