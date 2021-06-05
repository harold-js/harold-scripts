const path = require('path');
const fs = require('fs');
const vfile = require('to-vfile');
const Handlebars = require('handlebars');
const config = require('./constants');
const chalk = require('chalk');

// Handlebars compile process for 'pages' files
const generate = (fileName) => {
  const file = vfile.readSync(
    `${path.join(
      process.cwd(),
      `${config.srcDirName}/${config.pagesDirName}`
    )}/${fileName}`
  );

  const template = Handlebars.compile(String(file));

  file.contents = template({
    publicRelativeFileDir: `${config.publicDirName}`,
  });

  const filePath = `${path.join(process.cwd(), config.publicDirName)}/${
    path.parse(fileName).name
  }.html`;

  file.path = filePath;

  vfile.writeSync(file);
};

module.exports = () => {
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
