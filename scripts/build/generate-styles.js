import path from 'node:path';
import fs from 'node:fs';
import fse from 'fs-extra';
import { renderSync } from 'sass';
import { glob } from 'glob';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import chalk from 'chalk';
import config from './constants.js';

const generateStyles = () => {
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
        const scssProcessResult = renderSync({
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

export default generateStyles;
