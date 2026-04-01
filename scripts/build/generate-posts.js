import path from 'node:path';
import fs from 'node:fs';
import fse from 'fs-extra';
import chalk from 'chalk';
import { glob } from 'glob';
import { readSync, writeSync } from 'to-vfile';
import { unified } from 'unified';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import raw from 'rehype-raw';
import { matter } from 'vfile-matter';
import format from 'rehype-format';
import html from 'rehype-stringify';
import sanitize from 'rehype-sanitize';
import { defaultSchema } from 'hast-util-sanitize';
import deepMerge from 'deepmerge';
import Handlebars from 'handlebars';
import rehypeImgAttrs from './rehype-img-attrs.js';
import rehypeStyleWrappers from './rehype-style-wrappers.js';
import minifyHtml from './minify-html.js';
import config from './constants.js';
import {
  normalizeLineEndings,
  hasRequiredFields,
  extractFrontMatter,
} from './utils.js';

const schema = deepMerge(defaultSchema, {
  attributes: {
    '*': ['className'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
    iframe: ['src', 'width', 'height', 'allowFullScreen', 'allow'],
  },
  tagNames: ['iframe'],
});

let jsonPostsFileData = [];
const requiredFrontMatterFieldsNames = config.frontMatterAvailableKeys
  .filter((field) => field.required)
  .map((requiredField) => requiredField.name);

// parse files with Front Matter fields
const fileWithMatter = (relativePath) => {
  const file = readSync(
    path.join(
      process.cwd(),
      config.srcDirName,
      config.postsDirName,
      relativePath
    )
  );

  // Normalize line endings to LF to handle CRLF (Windows) files
  // This prevents front matter parsing issues with different line endings
  if (file.value) {
    file.value = normalizeLineEndings(file.value);
  }

  matter(file, { strip: true });

  return file;
};

// read .hbs layout file
const getLayout = (layout) => {
  return fs.readFileSync(
    `${path.join(
      process.cwd(),
      `${config.srcDirName}/${config.layoutsDirName}`
    )}/${layout}.hbs`,
    { encoding: 'utf8' }
  );
};

const generate = async (relativePath) => {
  return new Promise((resolve, reject) => {
    // Extract base name for title fallback
    const baseName = path.basename(relativePath, path.extname(relativePath));
    const fullFilePath = path.join(
      process.cwd(),
      config.srcDirName,
      config.postsDirName,
      relativePath
    );

    unified()
      .use(markdown)
      .use(remark2rehype, { allowDangerousHtml: true })
      .use(raw)
      .use(rehypeStyleWrappers)
      .use(rehypeImgAttrs, {
        publicPath: config.publicDirName,
        srcPath: config.srcDirName,
      })
      .use(format)
      .use(html)
      .use(sanitize, schema)
      .process(fileWithMatter(relativePath), async function (err, file) {
        if (err) {
          console.log(chalk.red('Something is wrong with the file!'));
          reject(err);
          return;
        }

        const frontMatterSettings = extractFrontMatter(file);
        const hasAllRequiredFields = hasRequiredFields(
          frontMatterSettings,
          requiredFrontMatterFieldsNames
        );

        if (hasAllRequiredFields) {
          const layoutTemplate = Handlebars.compile(
            getLayout(frontMatterSettings.layout)
          );

          // Calculate output directory preserving subdirectory structure
          const dirPath = path.dirname(relativePath);
          const outputDir =
            dirPath === '.' || dirPath === ''
              ? path.join(
                  process.cwd(),
                  config.publicDirName,
                  config.postsDirName
                )
              : path.join(
                  process.cwd(),
                  config.publicDirName,
                  config.postsDirName,
                  dirPath
                );

          // Ensure output directory exists
          fse.ensureDirSync(outputDir);

          const outputFileName = `${baseName}.html`;

          // Calculate fileName for JSON (includes relative path from posts root)
          const jsonFileName =
            dirPath === '.' || dirPath === ''
              ? outputFileName
              : path.join(dirPath, outputFileName).replace(/\\/g, '/'); // Normalize to forward slashes

          // Prepare data for json file with all posts data
          jsonPostsFileData.push({
            fileName: jsonFileName,
            title: frontMatterSettings.title || '',
            body: file.value.replace(/\n/g, ' ').trim(),
            excerpt: frontMatterSettings.excerpt || '',
            publicationDate: frontMatterSettings.publicationDate || 0,
            tags: frontMatterSettings.tags || [],
            coverImage: frontMatterSettings.coverImage || '',
          });

          // Calculate relative path to public root for Handlebars context
          const publicRelativeFileDir =
            dirPath === '.' || dirPath === ''
              ? `${config.publicDirName}/${config.postsDirName}`
              : path
                  .join(config.publicDirName, config.postsDirName, dirPath)
                  .replace(/\\/g, '/');

          // Prepare file with Handlebars template
          file.value = layoutTemplate({
            ...frontMatterSettings,
            title: frontMatterSettings.title || baseName,
            publicationDate:
              frontMatterSettings.publicationDate ||
              fs.statSync(fullFilePath).ctimeMs,
            content: file.value,
            publicRelativeFileDir: publicRelativeFileDir,
          });

          // Minify HTML if enabled
          file.value = await minifyHtml(file.value);

          // Set output file path
          file.path = path.join(outputDir, outputFileName);

          writeSync(file);
          resolve();
        } else {
          console.log(
            chalk.red(
              `Missing Front Matter keys for ${chalk.white.bgRed.bold(
                relativePath
              )}. Required keys are: ${chalk.bold.underline(
                requiredFrontMatterFieldsNames.join(', ')
              )}. File was not generated!
              `
            )
          );
          resolve();
        }
      });
  });
};

const generatePosts = async () => {
  const postsSrcDirPath = path.join(
    process.cwd(),
    `${config.srcDirName}/${config.postsDirName}`
  );

  // Skip if posts directory doesn't exist
  if (!fs.existsSync(postsSrcDirPath)) {
    console.log(
      chalk.yellow('No posts directory found. Skipping posts generation.')
    );
    return;
  }

  const postsPublicDirPath = path.join(
    process.cwd(),
    `${config.publicDirName}/${config.postsDirName}`
  );
  const jsonDirPath = `${path.join(process.cwd(), config.srcDirName)}/${
    config.jsonDataDirName
  }`;
  const jsonPostsFilePath = `${jsonDirPath}/posts.json`;
  jsonPostsFileData = [];

  // Ensure public posts directory exists before emptying
  fse.ensureDirSync(postsPublicDirPath);
  fse.emptyDirSync(postsPublicDirPath);

  const postsRootEntries = fs.readdirSync(postsSrcDirPath);

  if (postsRootEntries.length === 0) {
    console.log(
      chalk.yellow('Posts root directory is empty. Skipping posts generation.')
    );
    return;
  }

  // Use glob for recursive file discovery
  // Use pattern with cwd option for better cross-platform compatibility
  const markdownFiles = glob
    .sync('**/*.{md,markdown}', {
      cwd: postsSrcDirPath,
      absolute: false,
    })
    .map((relativePath) => {
      // Return relative path (already relative when using cwd)
      return relativePath;
    });

  // Skip if no markdown files found
  if (markdownFiles.length === 0) {
    return;
  }

  // Process all posts (now async)
  await Promise.all(
    markdownFiles.map((relativePath) => generate(relativePath))
  );

  if (!fs.existsSync(jsonDirPath)) {
    fs.mkdirSync(jsonDirPath);
  } else if (fs.existsSync(jsonPostsFilePath)) {
    fs.unlinkSync(jsonPostsFilePath);
  }

  fs.writeFileSync(
    jsonPostsFilePath,
    JSON.stringify(jsonPostsFileData),
    'utf8'
  );
};

export default generatePosts;
