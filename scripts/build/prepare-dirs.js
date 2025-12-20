import fse from 'fs-extra';
import fs from 'node:fs';
import path from 'node:path';
import config from './constants.js';

const prepareDirs = () => {
  fse.emptyDirSync(config.publicDirName);

  // Only create posts directory if it exists in src
  const postsSrcDirPath = path.join(
    process.cwd(),
    `${config.srcDirName}/${config.postsDirName}`
  );
  if (fs.existsSync(postsSrcDirPath)) {
    fse.ensureDirSync(`${config.publicDirName}/${config.postsDirName}`);
  }

  // Only create assets directory if it exists in src
  const assetsSrcDirPath = path.join(
    process.cwd(),
    `${config.srcDirName}/${config.assetsDirName}`
  );
  if (fs.existsSync(assetsSrcDirPath)) {
    fse.ensureDirSync(`${config.publicDirName}/${config.assetsDirName}`);
  }

  // Only create jsonData directory if it exists in src
  const jsonDataSrcDirPath = path.join(
    process.cwd(),
    `${config.srcDirName}/${config.jsonDataDirName}`
  );
  if (fs.existsSync(jsonDataSrcDirPath)) {
    fse.ensureDirSync(`${config.publicDirName}/${config.jsonDataDirName}`);
  }
};

export default prepareDirs;
