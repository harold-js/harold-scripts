import generatePosts from './generate-posts.js';
import generatePages from './generate-pages.js';
import generatePartials from './generate-partials.js';
import registerHelpers from './register-helpers.js';
import generateStyles from './generate-styles.js';

export const build = () => {
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

export default build;
