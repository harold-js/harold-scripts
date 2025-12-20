import path from 'node:path';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import fse from 'fs-extra';
import { renderSync } from 'sass';
import { glob } from 'glob';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcss from 'postcss';
import chalk from 'chalk';
import config from './constants.js';

const generateStyles = async () => {
  const stylesSrcPath = path.join(
    process.cwd(),
    `${config.srcDirName}/${config.stylesDirName}`
  );

  // Skip if styles directory doesn't exist
  if (!fsSync.existsSync(stylesSrcPath)) {
    console.log(
      chalk.yellow('No styles directory found. Skipping styles generation.')
    );
    return;
  }

  const files = glob.sync(
    path.join(
      process.cwd(),
      `${config.srcDirName}/${config.stylesDirName}`,
      '**/*.?(scss|css)'
    )
  );

  if (files && files.length > 0) {
    const stylePromises = files.map(async (fileName) => {
      if (
        ['.scss', '.css'].includes(path.extname(fileName)) &&
        path.parse(fileName).name.charAt(0) !== '_'
      ) {
        try {
          // TODO: migrate deprecated APIs
          const scssProcessResult = renderSync({
            file: fileName,
            sourceMap: true,
            silenceDeprecations: ['legacy-js-api'],
          });

          const outputDir = path
            .dirname(fileName)
            .replace(config.srcDirName, config.publicDirName);

          await fse.ensureDir(outputDir);

          // Build PostCSS plugins array
          const postcssPlugins = [autoprefixer];

          // Add cssnano (minification) if enabled in config
          if (config.minifyCss) {
            postcssPlugins.push(
              cssnano({
                preset: [
                  'default',
                  {
                    discardComments: {
                      removeAll: true,
                    },
                  },
                ],
              })
            );
          }

          // Process with PostCSS
          const result = await postcss(postcssPlugins).process(
            scssProcessResult.css.toString(),
            { from: fileName }
          );

          result.warnings().forEach((warn) => {
            console.warn(warn.toString());
          });

          const outputPath = `${outputDir}/${path.parse(fileName).name}.css`;
          await fs.writeFile(outputPath, result.css);
        } catch (err) {
          console.log(chalk.red(`Couldn't write the css file: ${fileName}`));
          console.error(err);
        }
      }
    });

    await Promise.all(stylePromises);
  } else {
    console.log(
      chalk.yellow(
        'No .scss or .css files found in styles directory. Skipping styles generation.'
      )
    );
  }
};

export default generateStyles;
