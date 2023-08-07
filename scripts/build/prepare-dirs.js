import fse from 'fs-extra';
import config from './constants.js';

const prepareDirs = () => {
  fse.emptyDirSync(config.publicDirName);
  fse.ensureDirSync(`${config.publicDirName}/${config.postsDirName}`);
  fse.ensureDirSync(`${config.publicDirName}/${config.assetsDirName}`);
  fse.ensureDirSync(`${config.publicDirName}/${config.jsonDataDirName}`);
};

export default prepareDirs;
