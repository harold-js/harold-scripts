const path = require('path');
const fs = require('fs');
const vfile = require('to-vfile');
const Handlebars = require('handlebars');
const config = require('./constants');

// Handlebars partials refister process
module.exports = () => {
  const files = fs.readdirSync(
    path.join(process.cwd(), `${config.srcDirName}/${config.partialsDirName}`)
  );

  if (files) {
    const partialsObject = {};

    files.forEach((fileName) => {
      const file = vfile.readSync(
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
