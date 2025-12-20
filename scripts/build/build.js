import generatePosts from './generate-posts.js';
import generatePages from './generate-pages.js';
import generatePartials from './generate-partials.js';
import registerHelpers from './register-helpers.js';
import generateStyles from './generate-styles.js';

export const build = async () => {
  // Register core helpers
  registerHelpers();

  // Generate partials
  generatePartials();

  // Generate posts/pages from markdown
  await generatePosts();

  // Generate styles from .scss source files
  await generateStyles();

  // Generate pages from .hbs source files
  await generatePages();
};

export default build;
