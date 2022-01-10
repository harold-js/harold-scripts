const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const chalk = require('chalk');
const vfile = require('to-vfile');
const unified = require('unified');
const markdown = require('remark-parse');
const remark2rehype = require('remark-rehype');
const raw = require('rehype-raw');
const matter = require('vfile-matter');
const format = require('rehype-format');
const html = require('rehype-stringify');
const sanitize = require('rehype-sanitize');
const sanitizeSchema = require('hast-util-sanitize/lib/github');
const deepMerge = require('deepmerge');
const Handlebars = require('handlebars');

const config = require('./constants');

const schema = deepMerge(sanitizeSchema, {
  attributes: {
    '*': ['className'],
    iframe: ['src', 'width', 'height', 'allowFullScreen', 'allow'],
  },
  tagNames: ['iframe'],
});

let jsonPostsFileData = [];
const requiredFrontMatterFieldsNames = config.frontMatterAvailableKeys
  .filter((field) => field.required)
  .map((requiredField) => requiredField.name);

// parse files with Front Matter fields
const fileWithMatter = (fileName) => {
  const file = vfile.readSync(
    `${path.join(
      process.cwd(),
      `${config.srcDirName}/${config.postsDirName}`
    )}/${fileName}`
  );
  return matter(file, { strip: true });
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

const generate = (fileName) => {
  unified()
    .use(markdown)
    .use(remark2rehype, { allowDangerousHtml: true })
    .use(raw)
    .use(format)
    .use(html)
    .use(sanitize, schema)
    .process(fileWithMatter(fileName), function (err, file) {
      if (err) {
        console.log(chalk.red('Something is wrong with the file!'));
      }

      const frontMatterSettings = file && file.data && file.data.matter;
      const frontMatterFields = Object.keys(frontMatterSettings || {});
      const hasRequiredFields = requiredFrontMatterFieldsNames.every((r) =>
        frontMatterFields.includes(r)
      );

      if (hasRequiredFields) {
        const layoutTemplate = Handlebars.compile(
          getLayout(frontMatterSettings.layout)
        );

        // Prepare data for json file with all posts data
        jsonPostsFileData.push({
          fileName: `${fileName.split('.')[0]}.html`,
          title: frontMatterSettings.title || '',
          body: file.contents.replace(/\n/g, ' ').trim(),
          excerpt: frontMatterSettings.excerpt || '',
          publicationDate: frontMatterSettings.publicationDate || 0,
          tags: frontMatterSettings.tags || [],
          coverImage: frontMatterSettings.coverImage || '',
        });

        // Prepare file with Handlebars template
        file.contents = layoutTemplate({
          ...frontMatterSettings,
          title: frontMatterSettings.title || fileName.split('.')[0],
          publicationDate:
            frontMatterSettings.publicationDate ||
            fs.statSync(
              `${path.join(
                process.cwd(),
                `${config.srcDirName}/${config.postsDirName}`
              )}/${fileName}`
            ).ctimeMs,
          content: file.contents,
          publicRelativeFileDir: `${config.publicDirName}/${config.postsDirName}`,
        });

        file.path = `${path.join(process.cwd(), config.publicDirName)}/${
          config.postsDirName
        }/${fileName.split('.')[0]}.html`;

        vfile.writeSync(file);
      } else {
        console.log(
          chalk.red(
            `Missing Front Matter keys for ${chalk.white.bgRed.bold(
              fileName
            )}. Required keys are: ${chalk.bold.underline(
              requiredFrontMatterFieldsNames.join(', ')
            )}. File was not generated!
            `
          )
        );
      }
    });
};

module.exports = () => {
  const postsSrcDirPath = path.join(
    process.cwd(),
    `${config.srcDirName}/${config.postsDirName}`
  );
  const postsPublicDirPath = path.join(
    process.cwd(),
    `${config.publicDirName}/${config.postsDirName}`
  );
  const jsonDirPath = `${path.join(process.cwd(), config.srcDirName)}/${
    config.jsonDataDirName
  }`;
  const jsonPostsFilePath = `${jsonDirPath}/posts.json`;
  jsonPostsFileData = [];

  fse.emptyDirSync(postsPublicDirPath);

  const postsInSrc = fs.readdirSync(postsSrcDirPath);
  postsInSrc.forEach(function (fileName) {
    generate(fileName);
  });

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
