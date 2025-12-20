import fse from 'fs-extra';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import config from './constants.js';

const copyJSONData = () => {
  const jsonDataSrcPath = `${config.srcDirName}/${config.jsonDataDirName}`;

  // Skip if jsonData directory doesn't exist
  if (!fs.existsSync(path.join(process.cwd(), jsonDataSrcPath))) {
    console.log(
      chalk.yellow('No jsonData directory found. Skipping JSON data copy.')
    );
    return;
  }

  fse.removeSync(`${config.publicDirName}/${config.jsonDataDirName}`);
  fse.copySync(
    jsonDataSrcPath,
    `${config.publicDirName}/${config.jsonDataDirName}`
  );
};

export default copyJSONData;
