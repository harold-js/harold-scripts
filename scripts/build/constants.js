const { cosmiconfigSync } = require('cosmiconfig');
const explorerSync = cosmiconfigSync('harold');
const loaded = explorerSync.search(`${process.cwd()}/src`);

module.exports = {
  srcDirName: 'src',
  layoutsDirName:
    loaded && loaded.config && loaded.config.mdFilesLayoutsDirName
      ? loaded.config.mdFilesLayoutsDirName
      : 'blog-layouts',
  partialsDirName: 'partials',
  postsDirName:
    loaded && loaded.config && loaded.config.mdFilesDirName
      ? loaded.config.mdFilesDirName
      : 'posts',
  pagesDirName: 'pages',
  assetsDirName: 'assets',
  publicDirName:
    loaded && loaded.config && loaded.config.outputDirName
      ? loaded.config.outputDirName
      : 'build',
  stylesDirName: 'styles',
  jsonDataDirName: 'jsonData',
  staticsDirName: 'statics',
  hostDirName:
    loaded && loaded.config && loaded.config.hostDirName
      ? loaded.config.hostDirName
      : '',
  frontMatterAvailableKeys: [
    {
      name: 'layout',
      required: true,
    },
    {
      name: 'title',
      required: true,
    },
    {
      name: 'publicationDate',
      required: true,
    },
    {
      name: 'excerpt',
      required: false,
    },
    {
      name: 'tags',
      required: false,
    },
    {
      name: 'coverImage',
      required: false,
    },
  ],
};
