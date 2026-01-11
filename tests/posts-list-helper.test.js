import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Handlebars from 'handlebars';
import fs from 'node:fs';
import registerHelpers from '../scripts/build/register-helpers.js';

describe('Posts List Helper', () => {
  // Sample posts data for testing
  const samplePosts = [
    {
      layout: 'blog-post',
      title: 'First Post',
      publicationDate: '2025-01-15',
      excerpt: 'This is the first post excerpt',
      tags: ['javascript', 'nodejs'],
      coverImage: 'images/post1.jpg',
      fileName: 'first-post.html',
    },
    {
      layout: 'blog-post',
      title: 'Second Post',
      publicationDate: '2025-01-10',
      excerpt: 'This is the second post excerpt',
      tags: ['python', 'testing'],
      coverImage: 'images/post2.jpg',
      fileName: 'second-post.html',
    },
    {
      layout: 'blog-post',
      title: 'Third Post',
      publicationDate: '2025-01-05',
      excerpt: 'This is the third post excerpt',
      tags: ['javascript', 'react'],
      coverImage: '',
      fileName: 'third-post.html',
    },
  ];

  before(() => {
    // Register helpers
    registerHelpers();
  });

  describe('basic functionality', () => {
    it('should generate post list with all posts', () => {
      // Mock fs.existsSync and fs.readFileSync
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should contain all post titles
      assert.ok(result.includes('First Post'), 'Should include first post');
      assert.ok(result.includes('Second Post'), 'Should include second post');
      assert.ok(result.includes('Third Post'), 'Should include third post');

      // Cleanup mocks
      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should sort posts by publication date (newest first)', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // First Post (2025-01-15) should appear before Second Post (2025-01-10)
      const firstPostIndex = result.indexOf('First Post');
      const secondPostIndex = result.indexOf('Second Post');
      const thirdPostIndex = result.indexOf('Third Post');

      assert.ok(
        firstPostIndex < secondPostIndex,
        'First post should appear before second post'
      );
      assert.ok(
        secondPostIndex < thirdPostIndex,
        'Second post should appear before third post'
      );

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should return null when posts.json does not exist', () => {
      mock.method(fs, 'existsSync', () => false);

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      assert.strictEqual(result, '', 'Should return empty string when no posts file');

      fs.existsSync.mock.restore();
    });

    it('should handle empty posts array', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify([]));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      assert.strictEqual(result, '', 'Should return empty string for empty posts');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });
  });

  describe('pagination', () => {
    it('should paginate posts with perPageLimit', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList perPageLimit=2}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should include first 2 posts only
      assert.ok(result.includes('First Post'), 'Should include first post');
      assert.ok(result.includes('Second Post'), 'Should include second post');
      assert.ok(!result.includes('Third Post'), 'Should not include third post');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should handle currentPage parameter', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile(
        '{{postsList perPageLimit=2 currentPage=2}}'
      );
      const result = template({ publicRelativeFileDir: 'build' });

      // Should include only the third post (page 2 with limit 2)
      assert.ok(!result.includes('First Post'), 'Should not include first post');
      assert.ok(!result.includes('Second Post'), 'Should not include second post');
      assert.ok(result.includes('Third Post'), 'Should include third post');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should return null for invalid page numbers', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile(
        '{{postsList perPageLimit=2 currentPage=10}}'
      );
      const result = template({ publicRelativeFileDir: 'build' });

      assert.strictEqual(
        result,
        '',
        'Should return empty string for page beyond available'
      );

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should handle currentPage < 1 as page 1', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile(
        '{{postsList perPageLimit=2 currentPage=0}}'
      );
      const result = template({ publicRelativeFileDir: 'build' });

      // Should show page 1 (first 2 posts)
      assert.ok(result.includes('First Post'), 'Should include first post');
      assert.ok(result.includes('Second Post'), 'Should include second post');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });
  });

  describe('filtering', () => {
    it('should filter posts by tag (byTagName)', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList byTagName="javascript"}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should include posts with javascript tag
      assert.ok(result.includes('First Post'), 'Should include first post');
      assert.ok(!result.includes('Second Post'), 'Should not include second post');
      assert.ok(result.includes('Third Post'), 'Should include third post');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should return empty for non-existent tag', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList byTagName="nonexistent"}}');
      const result = template({ publicRelativeFileDir: 'build' });

      assert.strictEqual(result, '', 'Should return empty for non-existent tag');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });
  });

  describe('display options', () => {
    it('should hide images with noImage flag', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList noImage=true}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should not contain image tags
      assert.ok(!result.includes('<img'), 'Should not include img tags');
      assert.ok(!result.includes('coverImage'), 'Should not include cover image');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should show images by default', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should contain image tags (for posts that have coverImage)
      assert.ok(result.includes('<img'), 'Should include img tags');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should hide excerpts with noExcerpt flag', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList noExcerpt=true}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should not contain excerpts
      assert.ok(
        !result.includes('first post excerpt'),
        'Should not include excerpt'
      );

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should show excerpts by default', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should contain excerpts
      assert.ok(
        result.includes('first post excerpt'),
        'Should include excerpt'
      );

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should hide tags with noTags flag', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList noTags=true}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should not contain tag names
      assert.ok(!result.includes('javascript'), 'Should not include tag names');
      assert.ok(!result.includes('python'), 'Should not include tag names');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should show tags by default', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should contain tags
      assert.ok(result.includes('javascript'), 'Should include tags');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should hide date with noDate flag', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList noDate=true}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should not contain dates
      assert.ok(!result.includes('2025-01-15'), 'Should not include dates');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should show date by default', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should contain dates
      assert.ok(result.includes('2025-01-15'), 'Should include dates');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should format dates with custom dateFormat', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile(
        '{{postsList dateFormat="mmmm dd, yyyy"}}'
      );
      const result = template({ publicRelativeFileDir: 'build' });

      // Should contain formatted date
      assert.ok(
        result.includes('January 15, 2025'),
        'Should format date with custom format'
      );

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should hide read more button with noReadMoreButton flag', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList noReadMoreButton=true}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should not contain read more button
      assert.ok(!result.includes('Read more'), 'Should not include read more button');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should show read more button by default', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should contain read more button
      assert.ok(result.includes('Read more'), 'Should include read more button');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should customize read more button label', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile(
        '{{postsList readMoreButtonLabel="Continue reading"}}'
      );
      const result = template({ publicRelativeFileDir: 'build' });

      // Should contain custom button label
      assert.ok(
        result.includes('Continue reading'),
        'Should use custom button label'
      );
      assert.ok(
        !result.includes('Read more'),
        'Should not use default button label'
      );

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should use custom className for styling', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile('{{postsList className="custom-posts"}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should contain custom class
      assert.ok(
        result.includes('class="custom-posts"'),
        'Should use custom className'
      );
      assert.ok(
        !result.includes('hrld-post-list'),
        'Should not use default className'
      );

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });
  });

  describe('combined features', () => {
    it('should combine pagination and filtering', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile(
        '{{postsList byTagName="javascript" perPageLimit=1}}'
      );
      const result = template({ publicRelativeFileDir: 'build' });

      // Should show only first javascript post
      assert.ok(result.includes('First Post'), 'Should include first post');
      assert.ok(!result.includes('Third Post'), 'Should not include third post');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should combine multiple display options', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(samplePosts));

      const template = Handlebars.compile(
        '{{postsList noImage=true noExcerpt=true noTags=true}}'
      );
      const result = template({ publicRelativeFileDir: 'build' });

      // Should only show title, date, and read more button
      assert.ok(result.includes('First Post'), 'Should include title');
      assert.ok(!result.includes('<img'), 'Should not include images');
      assert.ok(!result.includes('excerpt'), 'Should not include excerpts');
      assert.ok(!result.includes('javascript'), 'Should not include tags');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });
  });

  describe('nested subdirectory support', () => {
    // Sample posts with nested paths
    const nestedPosts = [
      {
        layout: 'blog-post',
        title: 'Root Post',
        publicationDate: '2025-01-20',
        excerpt: 'A post in the root',
        tags: ['general'],
        coverImage: '',
        fileName: 'root-post.html', // Root file (backward compatible)
      },
      {
        layout: 'blog-post',
        title: 'Category Post',
        publicationDate: '2025-01-18',
        excerpt: 'A post in a category',
        tags: ['javascript'],
        coverImage: 'images/cat.jpg',
        fileName: 'javascript/intro.html', // Single-level nesting
      },
      {
        layout: 'blog-post',
        title: 'Nested Post',
        publicationDate: '2025-01-15',
        excerpt: 'A deeply nested post',
        tags: ['layouts'],
        coverImage: '',
        fileName: 'layouts/dashboards/admin-dashboard.html', // Multi-level nesting
      },
    ];

    it('should handle posts with nested paths in fileName', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(nestedPosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should contain all post titles
      assert.ok(result.includes('Root Post'), 'Should include root post');
      assert.ok(result.includes('Category Post'), 'Should include category post');
      assert.ok(result.includes('Nested Post'), 'Should include nested post');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should construct correct URLs for nested posts', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(nestedPosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Check that URLs include the nested paths (getRelativePath converts to relative paths)
      // From 'build' to 'build/posts/root-post.html' = 'posts/root-post.html'
      assert.ok(
        result.includes('posts/root-post.html'),
        'Should include root post URL'
      );
      assert.ok(
        result.includes('posts/javascript/intro.html'),
        'Should include single-level nested URL'
      );
      assert.ok(
        result.includes('posts/layouts/dashboards/admin-dashboard.html'),
        'Should include multi-level nested URL'
      );

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should handle mixed structure (flat and nested posts together)', () => {
      const mixedPosts = [
        ...samplePosts, // Flat posts
        ...nestedPosts.slice(1), // Nested posts
      ];

      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(mixedPosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should handle both flat and nested posts
      assert.ok(result.includes('First Post'), 'Should include flat post');
      assert.ok(
        result.includes('posts/first-post.html'),
        'Should include flat post URL'
      );
      assert.ok(result.includes('Category Post'), 'Should include nested post');
      assert.ok(
        result.includes('posts/javascript/intro.html'),
        'Should include nested post URL'
      );

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should sort nested posts correctly by date', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(nestedPosts));

      const template = Handlebars.compile('{{postsList}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should be sorted by date (newest first)
      const rootIndex = result.indexOf('Root Post');
      const categoryIndex = result.indexOf('Category Post');
      const nestedIndex = result.indexOf('Nested Post');

      assert.ok(
        rootIndex < categoryIndex,
        'Root post (newest) should appear before category post'
      );
      assert.ok(
        categoryIndex < nestedIndex,
        'Category post should appear before nested post (oldest)'
      );

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should filter nested posts by tag correctly', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(nestedPosts));

      const template = Handlebars.compile('{{postsList byTagName="javascript"}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should only include posts with javascript tag
      assert.ok(result.includes('Category Post'), 'Should include category post');
      assert.ok(!result.includes('Root Post'), 'Should not include root post');
      assert.ok(!result.includes('Nested Post'), 'Should not include nested post');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });

    it('should paginate nested posts correctly', () => {
      mock.method(fs, 'existsSync', () => true);
      mock.method(fs, 'readFileSync', () => JSON.stringify(nestedPosts));

      const template = Handlebars.compile('{{postsList perPageLimit=2}}');
      const result = template({ publicRelativeFileDir: 'build' });

      // Should include first 2 posts (sorted by date)
      assert.ok(result.includes('Root Post'), 'Should include root post');
      assert.ok(result.includes('Category Post'), 'Should include category post');
      assert.ok(!result.includes('Nested Post'), 'Should not include third post');

      fs.existsSync.mock.restore();
      fs.readFileSync.mock.restore();
    });
  });
});

