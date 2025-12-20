import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Handlebars from 'handlebars';
import dateFormat from 'dateformat';

// Import the register helpers to test the actual helpers
import registerHelpers from '../scripts/build/register-helpers.js';

// Import utility functions to test
import {
  chunkArray,
  sortPostsByDate,
  filterPostsByTag,
} from '../scripts/build/utils.js';

describe('Harold Scripts - Handlebars Helpers', () => {
  before(() => {
    // Register all helpers before running tests
    registerHelpers();
  });

  describe('formatDate helper', () => {
    it('should format date with default format (yyyy-mm-dd)', () => {
      const template = Handlebars.compile('{{formatDate date="2025-01-15"}}');
      const result = template({});
      
      assert.strictEqual(result, '2025-01-15', 'Should format date correctly');
    });

    it('should format date with custom format', () => {
      const template = Handlebars.compile(
        '{{formatDate date="2025-01-15" format="mmmm dd, yyyy"}}'
      );
      const result = template({});
      
      assert.strictEqual(
        result,
        'January 15, 2025',
        'Should format date with custom format'
      );
    });

    it('should format date with short format', () => {
      const template = Handlebars.compile(
        '{{formatDate date="2025-12-25" format="mmm d, yy"}}'
      );
      const result = template({});
      
      assert.strictEqual(
        result,
        'Dec 25, 25',
        'Should format date with short format'
      );
    });

    it('should handle invalid date by throwing error', () => {
      const template = Handlebars.compile('{{formatDate date="not-a-date"}}');
      
      // formatDate throws on invalid dates (expected behavior)
      assert.throws(() => {
        template({});
      }, 'Should throw on invalid dates');
    });
  });

  describe('relativePath helper', () => {
    it('should generate relative path for assets', () => {
      const template = Handlebars.compile(
        '<link rel="stylesheet" href="{{relativePath "styles/main.css"}}">'
      );
      const result = template({
        publicRelativeFileDir: 'build',
      });
      
      assert.ok(
        result.includes('styles/main.css'),
        'Should include the asset path'
      );
    });
  });

  describe('hostDirName helper', () => {
    it('should return host directory name', () => {
      const template = Handlebars.compile('{{hostDirName}}');
      const result = template({});
      
      // Should return a string (empty or with value depending on config)
      assert.strictEqual(
        typeof result,
        'string',
        'Should return a string value'
      );
    });
  });

  describe('responsiveImg helper', () => {
    it('should generate img tag with required attributes', () => {
      const template = Handlebars.compile(
        '{{responsiveImg src="images/test.jpg" alt="Test Image"}}'
      );
      const result = template({
        publicRelativeFileDir: 'build',
      });
      
      assert.ok(result.includes('<img'), 'Should generate img tag');
      assert.ok(result.includes('alt="Test Image"'), 'Should include alt text');
      assert.ok(
        result.includes('loading="lazy"'),
        'Should include lazy loading by default'
      );
      assert.ok(
        result.includes('decoding="async"'),
        'Should include async decoding by default'
      );
    });

    it('should include custom dimensions when provided', () => {
      const template = Handlebars.compile(
        '{{responsiveImg src="images/test.jpg" alt="Test" width="800" height="600"}}'
      );
      const result = template({
        publicRelativeFileDir: 'build',
      });
      
      assert.ok(result.includes('width="800"'), 'Should include width');
      assert.ok(result.includes('height="600"'), 'Should include height');
    });

    it('should handle missing src gracefully', () => {
      const template = Handlebars.compile('{{responsiveImg alt="No Source"}}');
      const result = template({
        publicRelativeFileDir: 'build',
      });
      
      // Should return empty string when src is missing
      assert.strictEqual(result, '', 'Should return empty string without src');
    });

    it('should include className when provided', () => {
      const template = Handlebars.compile(
        '{{responsiveImg src="images/test.jpg" alt="Test" className="featured-image"}}'
      );
      const result = template({
        publicRelativeFileDir: 'build',
      });
      
      assert.ok(
        result.includes('class="featured-image"'),
        'Should include custom class'
      );
    });
  });
});

describe('Harold Scripts - Utility Functions', () => {
  describe('chunkArray utility', () => {
    it('should split array into chunks of specified size', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const chunks = chunkArray(array, 3);

      assert.strictEqual(chunks.length, 3, 'Should create 3 chunks');
      assert.deepStrictEqual(
        chunks[0],
        [1, 2, 3],
        'First chunk should be correct'
      );
      assert.deepStrictEqual(
        chunks[1],
        [4, 5, 6],
        'Second chunk should be correct'
      );
      assert.deepStrictEqual(
        chunks[2],
        [7, 8, 9],
        'Third chunk should be correct'
      );
    });

    it('should handle array not evenly divisible by chunk size', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const chunks = chunkArray(array, 3);

      assert.strictEqual(chunks.length, 3, 'Should create 3 chunks');
      assert.deepStrictEqual(
        chunks[2],
        [7],
        'Last chunk should have remaining items'
      );
    });

    it('should handle empty array', () => {
      const array = [];
      const chunks = chunkArray(array, 3);

      assert.strictEqual(chunks.length, 0, 'Should return empty array');
    });

    it('should handle non-array input', () => {
      const notArray = 'not an array';
      const chunks = chunkArray(notArray, 3);

      assert.strictEqual(
        chunks.length,
        0,
        'Should return empty array for non-array input'
      );
    });

    it('should handle chunk size of 1', () => {
      const array = [1, 2, 3];
      const chunks = chunkArray(array, 1);

      assert.strictEqual(chunks.length, 3, 'Should create 3 chunks');
      assert.deepStrictEqual(chunks[0], [1], 'Each chunk should have 1 item');
    });

    it('should handle chunk size larger than array', () => {
      const array = [1, 2, 3];
      const chunks = chunkArray(array, 10);

      assert.strictEqual(chunks.length, 1, 'Should create 1 chunk');
      assert.deepStrictEqual(
        chunks[0],
        [1, 2, 3],
        'Chunk should contain all items'
      );
    });
  });

  describe('sortPostsByDate', () => {
    it('should sort posts by publication date descending', () => {
      const posts = [
        { title: 'Post 1', publicationDate: '2025-01-01' },
        { title: 'Post 2', publicationDate: '2025-03-01' },
        { title: 'Post 3', publicationDate: '2025-02-01' },
      ];

      const sorted = sortPostsByDate(posts);

      assert.strictEqual(
        sorted[0].title,
        'Post 2',
        'Most recent post should be first'
      );
      assert.strictEqual(
        sorted[1].title,
        'Post 3',
        'Middle post should be second'
      );
      assert.strictEqual(
        sorted[2].title,
        'Post 1',
        'Oldest post should be last'
      );
    });

    it('should handle empty array', () => {
      const posts = [];
      const sorted = sortPostsByDate(posts);

      assert.strictEqual(sorted.length, 0, 'Should return empty array');
    });

    it('should handle non-array input', () => {
      const notArray = 'not an array';
      const sorted = sortPostsByDate(notArray);

      assert.strictEqual(
        sorted.length,
        0,
        'Should return empty array for non-array'
      );
    });

    it('should handle posts with same date', () => {
      const posts = [
        { title: 'Post 1', publicationDate: '2025-01-01' },
        { title: 'Post 2', publicationDate: '2025-01-01' },
      ];

      const sorted = sortPostsByDate(posts);

      assert.strictEqual(sorted.length, 2, 'Should return all posts');
    });
  });

  describe('filterPostsByTag', () => {
    it('should filter posts by tag name', () => {
      const posts = [
        { title: 'Post 1', tags: ['javascript', 'nodejs'] },
        { title: 'Post 2', tags: ['python', 'django'] },
        { title: 'Post 3', tags: ['javascript', 'react'] },
      ];

      const filtered = filterPostsByTag(posts, 'javascript');

      assert.strictEqual(filtered.length, 2, 'Should return 2 posts');
      assert.strictEqual(
        filtered[0].title,
        'Post 1',
        'Should include first post'
      );
      assert.strictEqual(
        filtered[1].title,
        'Post 3',
        'Should include third post'
      );
    });

    it('should return empty array when no posts match tag', () => {
      const posts = [
        { title: 'Post 1', tags: ['javascript'] },
        { title: 'Post 2', tags: ['python'] },
      ];

      const filtered = filterPostsByTag(posts, 'ruby');

      assert.strictEqual(filtered.length, 0, 'Should return empty array');
    });

    it('should return original array when tagName is empty', () => {
      const posts = [
        { title: 'Post 1', tags: ['javascript'] },
        { title: 'Post 2', tags: ['python'] },
      ];

      const filtered = filterPostsByTag(posts, '');

      assert.strictEqual(
        filtered.length,
        2,
        'Should return all posts when tagName is empty'
      );
    });

    it('should handle posts without tags array', () => {
      const posts = [
        { title: 'Post 1', tags: ['javascript'] },
        { title: 'Post 2' }, // no tags
        { title: 'Post 3', tags: null }, // null tags
      ];

      const filtered = filterPostsByTag(posts, 'javascript');

      assert.strictEqual(
        filtered.length,
        1,
        'Should only return posts with matching tags'
      );
    });

    it('should handle non-array input', () => {
      const notArray = 'not an array';
      const filtered = filterPostsByTag(notArray, 'tag');

      assert.strictEqual(
        filtered.length,
        0,
        'Should return empty array for non-array'
      );
    });
  });
});
