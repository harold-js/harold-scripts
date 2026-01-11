import { parse } from 'node:path';
import path from 'node:path';
import fs from 'node:fs';
import fse from 'fs-extra';
import copyAssets from '../build/copy-assets.js';
import copyJSONData from '../build/copy-json-data.js';
import config from '../build/constants.js';
import copyStatics from '../build/copy-statics.js';
import build from '../build/build.js';

// Operations for file changes listener
const listenerCallback = async (event, filePath) => {
  await build();
  if (filePath.includes(`${config.srcDirName}/${config.assetsDirName}`)) {
    copyAssets();
  }
  if (filePath.includes(`${config.srcDirName}/${config.postsDirName}`)) {
    copyJSONData();

    // Handle markdown file deletions in nested directories
    if (event === 'unlink' && (filePath.endsWith('.md') || filePath.endsWith('.markdown'))) {
      const postsSrcDirPath = path.join(
        process.cwd(),
        config.srcDirName,
        config.postsDirName
      );

      // Get relative path from posts directory
      const relativePath = path.relative(postsSrcDirPath, filePath);
      const baseName = path.basename(relativePath, path.extname(relativePath));
      const outputDir = path.join(
        process.cwd(),
        config.publicDirName,
        config.postsDirName,
        path.dirname(relativePath)
      );
      const htmlFile = path.join(outputDir, `${baseName}.html`);

      // Remove HTML file if it exists
      if (fse.pathExistsSync(htmlFile)) {
        fse.removeSync(htmlFile);

        // Remove empty directories up to posts root
        let currentDir = outputDir;
        const postsPublicDirPath = path.join(
          process.cwd(),
          config.publicDirName,
          config.postsDirName
        );

        while (currentDir !== postsPublicDirPath) {
          try {
            const files = fs.readdirSync(currentDir);
            if (files.length === 0) {
              fse.removeSync(currentDir);
              currentDir = path.dirname(currentDir);
            } else {
              break;
            }
          } catch (err) {
            break;
          }
        }
      }
    }
  }
  if (filePath.includes(`${config.srcDirName}/${config.staticsDirName}`)) {
    copyStatics();
    if (event === 'unlink') {
      const publicPath = filePath.replace(
        `${config.srcDirName}/${config.staticsDirName}`,
        config.publicDirName
      );
      fse.removeSync(publicPath);
    }
  }
  if (
    filePath.includes(`${config.srcDirName}/${config.pagesDirName}`) &&
    event === 'unlink'
  ) {
    const pathSplit = filePath.split('/');
    const fileNameHbs = pathSplit[pathSplit.length - 1];
    const filenameHtml = `${parse(fileNameHbs).name}.html`;
    const publicFilePath = `${config.publicDirName}/${filenameHtml}`;
    fse.removeSync(publicFilePath);
  }
  console.log(`${event}: ${filePath}`);
};

export default listenerCallback;
