import fse from 'fs-extra';
import config from './constants.js';

const copyAssets = () => {
  fse.removeSync(`${config.publicDirName}/${config.assetsDirName}`);
  fse.copySync(
    `${config.srcDirName}/${config.assetsDirName}`,
    `${config.publicDirName}/${config.assetsDirName}`
  );
};

export default copyAssets;
