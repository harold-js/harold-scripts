const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const dateformat = require('dateformat');
const chalk = require('chalk');

const config = require('./constants');

const getRelativePath = (filePath, options) =>
  path.relative(`${options.data.root.publicRelativeFileDir}`, filePath);

// Handlebars core helpers
module.exports = () => {
  Handlebars.registerHelper({
    relativePath: function (assetPath, options) {
      return getRelativePath(`${config.publicDirName}/${assetPath}`, options);
    },

    hostDirName: function () {
      return config.hostDirName;
    },

    formatDate: function (options) {
      const { date, format = 'yyyy-mm-dd' } = options.hash;
      if (date && typeof date === 'string') {
        return dateformat(new Date(date), format);
      }
      console.log(
        chalk.red.bold(
          'publicationDate should be a date string in format YYYY-MM-DD'
        )
      );
      return '';
    },

    // TODO: dynamic pagination solution?
    postsList: function (options) {
      const {
        perPageLimit,
        byTagName,
        currentPage = 1,
        className = 'hrld-post-list',
        noImage = false,
        noExcerpt = false,
        noTags = false,
        noDate = false,
        noReadMoreButton = false,
        readMoreButtonLabel = 'Read more',
        dateFormat = 'yyyy-mm-dd',
      } = options.hash;

      // Based on previously generated json file with posts contents
      // It will be possible to copy this json file to public source for other purposes like dynamic search etc.
      const postsJsonFile = `${path.join(process.cwd(), config.srcDirName)}/${
        config.jsonDataDirName
      }/posts.json`;
      const posts = fs.existsSync(postsJsonFile)
        ? fs.readFileSync(postsJsonFile)
        : [];

      const chunkArray = (array, size) => {
        const result = [];
        if (Array.isArray(array)) {
          for (let i = 0; i < array.length; i += size) {
            const chunk = array.slice(i, i + size);
            result.push(chunk);
          }
        }
        return result;
      };

      if (posts && posts.length > 0) {
        let postsSortedAndFiltered = [];

        const sorted = JSON.parse(posts).sort(
          (a, b) =>
            new Date(b.publicationDate).getTime() -
            new Date(a.publicationDate).getTime()
        );

        postsSortedAndFiltered = sorted;

        if (byTagName) {
          postsSortedAndFiltered = postsSortedAndFiltered.filter((post) =>
            post.tags.includes(byTagName)
          );
        }

        const chunked = chunkArray(
          postsSortedAndFiltered,
          perPageLimit || sorted.length
        );

        const currentPageIndex = currentPage > 0 ? currentPage - 1 : 0;

        if (chunked.length - 1 >= currentPageIndex) {
          return new Handlebars.SafeString(`
            <div class="${className}">
              ${chunked[currentPageIndex]
                .map(
                  (item) =>
                    `<article class="${className}--article">
                      ${
                        item.coverImage && !noImage
                          ? `<div class="${className}--image"><a href="${getRelativePath(
                              `${config.publicDirName}/${config.postsDirName}/${item.fileName}`,
                              options
                            )}"><img src='${item.coverImage}' alt="${
                              item.title
                            }" /></a></div>`
                          : ''
                      }
                      ${
                        !noDate
                          ? `<div class="${className}--date">${dateformat(
                              new Date(item.publicationDate),
                              dateFormat
                            )}</div>`
                          : ''
                      }
                      <div class="${className}--title">
                        <a href="${getRelativePath(
                          `${config.publicDirName}/${config.postsDirName}/${item.fileName}`,
                          options
                        )}">
                          ${item.title}
                        </a>
                      </div>
                      ${
                        !noTags
                          ? `<div class="${className}--tags">${item.tags.join(
                              ', '
                            )}</div>`
                          : ''
                      }
                      ${
                        !noExcerpt
                          ? `<div class="${className}--excerpt">${item.excerpt}</div>`
                          : ''
                      }
                      ${
                        !noReadMoreButton
                          ? `<div>
                        <a href="${getRelativePath(
                          `${config.publicDirName}/${config.postsDirName}/${item.fileName}`,
                          options
                        )}" class="${className}--button">${readMoreButtonLabel}</a>
                      </div>`
                          : ''
                      }
                    </article>`
                )
                .join('')}
            </div>
          `);
        }
        return null;
      }
      return null;
    },
  });
};
