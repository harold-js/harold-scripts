const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const sass = require('sass');
const config = require('./constants');
const glob = require('glob');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const chalk = require('chalk');

module.exports = () => {
  const files = glob.sync(
    path.join(
      process.cwd(),
      `${config.srcDirName}/${config.stylesDirName}`,
      '**/*.?(scss|css)'
    )
  );

  if (files) {
    files.forEach((fileName) => {
      if (
        ['.scss', '.css'].includes(path.extname(fileName)) &&
        path.parse(fileName).name.charAt(0) !== '_'
      ) {
        const scssProcessResult = sass.renderSync({
          file: fileName,
          sourceMap: true,
        });
        fse
          .ensureDir(
            path
              .dirname(fileName)
              .replace(config.srcDirName, config.publicDirName)
          )
          .then(() =>
            postcss([autoprefixer]).process(scssProcessResult.css.toString(), {
              from: fileName,
            })
          )
          .then((result) => {
            result.warnings().forEach((warn) => {
              console.warn(warn.toString());
            });
            fs.writeFile(
              `${path
                .dirname(fileName)
                .replace(config.srcDirName, config.publicDirName)}/${
                path.parse(fileName).name
              }.css`,
              result.css,
              (err) => {
                if (err) console.log(chalk.red("Couldn't write the css file"));
              }
            );
          });
      }
    });
  }
};
