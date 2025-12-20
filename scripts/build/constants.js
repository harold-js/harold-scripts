import { cosmiconfigSync } from 'cosmiconfig';

const explorerSync = cosmiconfigSync('harold', { stopDir: process.cwd() });
const loaded = explorerSync.search(`${process.cwd()}/src`);

const config = {
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
  minifyCss:
    loaded && loaded.config && typeof loaded.config.minifyCss === 'boolean'
      ? loaded.config.minifyCss
      : true,
  minifyHtml:
    loaded && loaded.config && typeof loaded.config.minifyHtml === 'boolean'
      ? loaded.config.minifyHtml
      : true,
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

export default config;
