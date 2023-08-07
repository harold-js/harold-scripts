import path from 'node:path';
import fs from 'node:fs';
import { readSync } from 'to-vfile';
import Handlebars from 'handlebars';
import config from './constants.js';

// Handlebars partials refister process
const generatePartials = () => {
  const files = fs.readdirSync(
    path.join(process.cwd(), `${config.srcDirName}/${config.partialsDirName}`)
  );

  if (files) {
    const partialsObject = {};

    files.forEach((fileName) => {
      const file = readSync(
        `${path.join(
          process.cwd(),
          `${config.srcDirName}/${config.partialsDirName}`
        )}/${fileName}`
      );
      partialsObject[path.basename(fileName, '.hbs')] = String(file);
    });

    Handlebars.registerPartial(partialsObject);
  }
};

export default generatePartials;
