import { minify } from 'html-minifier-terser';
import config from './constants.js';

/**
 * Minify HTML content
 * @param {string} html - HTML content to minify
 * @returns {Promise<string>} - Minified HTML
 */
export const minifyHtml = async (html) => {
  if (!config.minifyHtml) {
    return html;
  }

  try {
    return await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true,
      keepClosingSlash: true,
      caseSensitive: true,
      conservativeCollapse: false,
      preserveLineBreaks: false,
    });
  } catch (err) {
    console.error('HTML minification error:', err);
    return html; // Return original HTML if minification fails
  }
};

export default minifyHtml;
