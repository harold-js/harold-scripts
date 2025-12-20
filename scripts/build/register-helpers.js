import fs from 'node:fs';
import path from 'node:path';
import Handlebars from 'handlebars';
import dateFormat from 'dateformat';
import sizeOf from 'image-size';
import chalk from 'chalk';
import config from './constants.js';

const dformat = dateFormat;

const getRelativePath = (filePath, options) =>
  path.relative(`${options.data.root.publicRelativeFileDir}`, filePath);

// Handlebars core helpers
const registerHelpers = () => {
  Handlebars.registerHelper({
    relativePath: function (assetPath, options) {
      return getRelativePath(`${config.publicDirName}/${assetPath}`, options);
    },

    hostDirName: function () {
      return config.hostDirName;
    },

    // Responsive image helper with lazy loading and dimensions
    responsiveImg: function (options) {
      const {
        src,
        alt = '',
        width,
        height,
        loading = 'lazy',
        decoding = 'async',
        className = '',
        sizes,
        srcset,
      } = options.hash;

      if (!src) {
        console.log(chalk.red.bold('responsiveImg requires a src attribute'));
        return '';
      }

      const relativeSrc = getRelativePath(
        `${config.publicDirName}/${src}`,
        options
      );

      let imgAttrs = `src="${relativeSrc}" alt="${alt || ''}"`;

      // Add dimensions if provided
      if (width) imgAttrs += ` width="${width}"`;
      if (height) imgAttrs += ` height="${height}"`;

      // Try to get dimensions automatically if not provided
      if ((!width || !height) && !src.startsWith('http')) {
        try {
          const imagePath = path.join(process.cwd(), config.publicDirName, src);
          if (fs.existsSync(imagePath)) {
            const dimensions = sizeOf(imagePath);
            if (!width && dimensions.width)
              imgAttrs += ` width="${dimensions.width}"`;
            if (!height && dimensions.height)
              imgAttrs += ` height="${dimensions.height}"`;
          }
        } catch {
          // Silently fail
        }
      }

      // Add loading and decoding attributes
      imgAttrs += ` loading="${loading}" decoding="${decoding}"`;

      // Add srcset if provided
      if (srcset) {
        imgAttrs += ` srcset="${srcset}"`;
      }

      // Add sizes if provided
      if (sizes) {
        imgAttrs += ` sizes="${sizes}"`;
      }

      // Add class if provided
      if (className) {
        imgAttrs += ` class="${className}"`;
      }

      return new Handlebars.SafeString(`<img ${imgAttrs} />`);
    },

    formatDate: function (options) {
      const { date, format = 'yyyy-mm-dd' } = options.hash;
      if (date && typeof date === 'string') {
        return dformat(new Date(date), format);
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
                            }" loading="lazy" decoding="async" /></a></div>`
                          : ''
                      }
                      ${
                        !noDate
                          ? `<div class="${className}--date">${dformat(
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

export default registerHelpers;
