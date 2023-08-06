import fse from 'fs-extra';
import config from './constants.js';

const copyStatic = () => {
  if (fse.pathExistsSync(`${config.srcDirName}/${config.staticsDirName}`)) {
    fse.copySync(
      `${config.srcDirName}/${config.staticsDirName}`,
      `${config.publicDirName}`
    );
  }
};

export default copyStatic;
