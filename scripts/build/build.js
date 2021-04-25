const generatePosts = require('./generate-posts');
const generatePages = require('./generate-pages');
const generatePartials = require('./generate-partials');
const registerHelpers = require('./register-helpers');
const generateStyles = require('./generate-styles');

module.exports = () => {
  // Register core helpers
  registerHelpers();

  // Generate partials
  generatePartials();

  // Generate posts/pages from markdown
  generatePosts();

  // Generate styles from .scss source files
  generateStyles();

  // Generate pages from .hbs source files
  generatePages();
};
