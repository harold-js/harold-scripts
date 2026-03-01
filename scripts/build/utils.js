/**
 * Utility functions for harold-scripts
 */

/**
 * Splits an array into chunks of specified size
 * @param {Array} array - The array to chunk
 * @param {number} size - The size of each chunk
 * @returns {Array[]} Array of chunks
 */
export const chunkArray = (array, size) => {
  const result = [];
  if (Array.isArray(array)) {
    for (let i = 0; i < array.length; i += size) {
      const chunk = array.slice(i, i + size);
      result.push(chunk);
    }
  }
  return result;
};

/**
 * Sorts posts by publication date in descending order (newest first)
 * @param {Array} posts - Array of post objects with publicationDate
 * @returns {Array} Sorted array of posts
 */
export const sortPostsByDate = (posts) => {
  if (!Array.isArray(posts)) {
    return [];
  }
  return posts.sort(
    (a, b) =>
      new Date(b.publicationDate).getTime() -
      new Date(a.publicationDate).getTime()
  );
};

/**
 * Filters posts by tag name
 * @param {Array} posts - Array of post objects
 * @param {string} tagName - Tag name to filter by
 * @returns {Array} Filtered array of posts
 */
export const filterPostsByTag = (posts, tagName) => {
  if (!Array.isArray(posts)) {
    return [];
  }
  if (!tagName) {
    return posts;
  }
  return posts.filter(
    (post) => Array.isArray(post.tags) && post.tags.includes(tagName)
  );
};

/**
 * Normalizes line endings to LF (Unix style)
 * Handles both Buffer and String inputs
 * @param {Buffer|string} content - Content to normalize
 * @returns {string} Content with normalized line endings
 */
export const normalizeLineEndings = (content) => {
  if (!content) {
    return content;
  }

  const str = Buffer.isBuffer(content)
    ? content.toString('utf8')
    : String(content);

  return str.replace(/\r\n/g, '\n');
};

/**
 * Validates that an object contains all required fields
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {boolean} True if all required fields are present
 */
export const hasRequiredFields = (obj, requiredFields) => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  if (!Array.isArray(requiredFields)) {
    return false;
  }

  const objectKeys = Object.keys(obj);
  return requiredFields.every((field) => objectKeys.includes(field));
};

/**
 * Extracts front matter fields from a vfile
 * @param {Object} file - vfile object with data.matter
 * @returns {Object|null} Front matter object or null if not found
 */
export const extractFrontMatter = (file) => {
  if (!file || !file.data || !file.data.matter) {
    return null;
  }
  return file.data.matter;
};
