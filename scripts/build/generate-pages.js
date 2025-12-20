import path from 'node:path';
import fs from 'node:fs';
import { readSync, writeSync } from 'to-vfile';
import Handlebars from 'handlebars';
import chalk from 'chalk';
import minifyHtml from './minify-html.js';
import config from './constants.js';

// Handlebars compile process for 'pages' files
const generate = async (fileName) => {
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

  // Minify HTML if enabled
  file.value = await minifyHtml(file.value);

  const filePath = `${path.join(process.cwd(), config.publicDirName)}/${
    path.parse(fileName).name
  }.html`;

  file.path = filePath;

  writeSync(file);
};

const generatePages = async () => {
  const pagesSrcPath = path.join(
    process.cwd(),
    `${config.srcDirName}/${config.pagesDirName}`
  );

  // Skip if pages directory doesn't exist
  if (!fs.existsSync(pagesSrcPath)) {
    console.log(
      chalk.yellow('No pages directory found. Skipping pages generation.')
    );
    return;
  }

  const files = fs.readdirSync(pagesSrcPath);

  // Filter only .hbs files
  const hbsFiles = files.filter((fileName) => fileName.endsWith('.hbs'));

  if (hbsFiles.length === 0) {
    console.log(
      chalk.yellow(
        'No .hbs files found in pages directory. Skipping pages generation.'
      )
    );
    return;
  }

  // Process all pages (now async)
  await Promise.all(hbsFiles.map((fileName) => generate(fileName)));
};

export default generatePages;
