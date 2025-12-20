import path from 'node:path';
import fs from 'node:fs';
import { readSync } from 'to-vfile';
import Handlebars from 'handlebars';
import chalk from 'chalk';
import config from './constants.js';

// Handlebars partials refister process
const generatePartials = () => {
  const partialsSrcPath = path.join(
    process.cwd(),
    `${config.srcDirName}/${config.partialsDirName}`
  );

  // Skip if partials directory doesn't exist
  if (!fs.existsSync(partialsSrcPath)) {
    console.log(
      chalk.yellow(
        'No partials directory found. Skipping partials registration.'
      )
    );
    return;
  }

  const files = fs.readdirSync(partialsSrcPath);

  // Filter only .hbs files
  const hbsFiles = files.filter((fileName) => fileName.endsWith('.hbs'));

  if (hbsFiles && hbsFiles.length > 0) {
    const partialsObject = {};

    hbsFiles.forEach((fileName) => {
      const file = readSync(`${partialsSrcPath}/${fileName}`);
      partialsObject[path.basename(fileName, '.hbs')] = String(file);
    });

    Handlebars.registerPartial(partialsObject);
  } else {
    console.log(
      chalk.yellow(
        'No .hbs files found in partials directory. Skipping partials registration.'
      )
    );
  }
};

export default generatePartials;
