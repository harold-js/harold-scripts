module.exports = {
  srcDirName: 'src',
  layoutsDirName: 'blog-layouts',
  partialsDirName: 'partials',
  postsDirName: 'posts',
  pagesDirName: 'pages',
  assetsDirName: 'assets',
  publicDirName: 'build',
  stylesDirName: 'styles',
  jsonDataDirName: 'jsonData',
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
