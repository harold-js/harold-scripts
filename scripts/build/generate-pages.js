import path from 'node:path';
import fs from 'node:fs';
import { readSync, writeSync } from 'to-vfile';
import Handlebars from 'handlebars';
import chalk from 'chalk';
import config from './constants.js';

// Handlebars compile process for 'pages' files
const generate = (fileName) => {
  const file = readSync(
    `${path.join(
      process.cwd(),
      `${config.srcDirName}/${config.pagesDirName}`
    )}/${fileName}`
  );

  const template = Handlebars.compile(String(file));

  file.value = template({
    publicRelativeFileDir: `${config.publicDirName}`,
  });

  const filePath = `${path.join(process.cwd(), config.publicDirName)}/${
    path.parse(fileName).name
  }.html`;

  file.path = filePath;

  writeSync(file);
};

const generatePages = () => {
  fs.readdir(
    path.join(process.cwd(), `${config.srcDirName}/${config.pagesDirName}`),
    function (err, files) {
      if (err) {
        console.log(chalk.red('Error getting directory information.'));
      } else {
        files.forEach(function (fileName) {
          generate(fileName);
        });
      }
    }
  );
};

export default generatePages;
