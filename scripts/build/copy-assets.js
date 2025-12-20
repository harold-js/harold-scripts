import fse from 'fs-extra';
import chalk from 'chalk';
import config from './constants.js';

const copyAssets = () => {
  const assetsSrcPath = `${config.srcDirName}/${config.assetsDirName}`;

  // Skip if assets directory doesn't exist
  if (!fse.pathExistsSync(assetsSrcPath)) {
    console.log(
      chalk.yellow('No assets directory found. Skipping assets copy.')
    );
    return;
  }

  fse.removeSync(`${config.publicDirName}/${config.assetsDirName}`);
  fse.copySync(
    assetsSrcPath,
    `${config.publicDirName}/${config.assetsDirName}`
  );
};

export default copyAssets;
