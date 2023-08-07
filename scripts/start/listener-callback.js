import { parse } from 'node:path';
import fse from 'fs-extra';
import copyAssets from '../build/copy-assets.js';
import copyJSONData from '../build/copy-json-data.js';
import config from '../build/constants.js';
import copyStatics from '../build/copy-statics.js';
import build from '../build/build.js';

// Operations for file changes listener
const listenerCallback = (event, path) => {
  build();
  if (path.includes(`${config.srcDirName}/${config.assetsDirName}`)) {
    copyAssets();
  }
  if (path.includes(`${config.srcDirName}/${config.postsDirName}`)) {
    copyJSONData();
  }
  if (path.includes(`${config.srcDirName}/${config.staticsDirName}`)) {
    copyStatics();
    if (event === 'unlink') {
      const publicPath = path.replace(
        `${config.srcDirName}/${config.staticsDirName}`,
        config.publicDirName
      );
      fse.removeSync(publicPath);
    }
  }
  if (
    path.includes(`${config.srcDirName}/${config.pagesDirName}`) &&
    event === 'unlink'
  ) {
    const pathSplit = path.split('/');
    const fileNameHbs = pathSplit[pathSplit.length - 1];
    const filenameHtml = `${parse(fileNameHbs).name}.html`;
    const publicFilePath = `${config.publicDirName}/${filenameHtml}`;
    fse.removeSync(publicFilePath);
  }
  console.log(`${event}: ${path}`);
};

export default listenerCallback;
