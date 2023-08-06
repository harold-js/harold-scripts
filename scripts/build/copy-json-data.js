import fse from 'fs-extra';
import config from './constants.js';

const copyJSONData = () => {
  fse.removeSync(`${config.publicDirName}/${config.jsonDataDirName}`);
  fse.copySync(
    `${config.srcDirName}/${config.jsonDataDirName}`,
    `${config.publicDirName}/${config.jsonDataDirName}`
  );
};

export default copyJSONData;
