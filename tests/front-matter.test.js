import { describe, it } from 'node:test';
import assert from 'node:assert';
import { VFile } from 'vfile';
import { matter } from 'vfile-matter';
import {
  normalizeLineEndings,
  hasRequiredFields,
  extractFrontMatter,
} from '../scripts/build/utils.js';

describe('Front Matter Parsing', () => {
  describe('normalizeLineEndings', () => {
    it('should convert CRLF to LF', () => {
      const content = 'line1\r\nline2\r\nline3';
      const result = normalizeLineEndings(content);

      assert.strictEqual(result, 'line1\nline2\nline3', 'Should convert CRLF to LF');
      assert.ok(!result.includes('\r\n'), 'Should not contain CRLF');
    });

    it('should preserve LF line endings', () => {
      const content = 'line1\nline2\nline3';
      const result = normalizeLineEndings(content);

      assert.strictEqual(result, 'line1\nline2\nline3', 'Should preserve LF');
    });

    it('should handle mixed line endings', () => {
      const content = 'line1\r\nline2\nline3\r\nline4';
      const result = normalizeLineEndings(content);

      assert.strictEqual(
        result,
        'line1\nline2\nline3\nline4',
        'Should normalize mixed endings'
      );
      assert.ok(!result.includes('\r'), 'Should not contain any CR');
    });

    it('should handle Buffer input with CRLF', () => {
      const buffer = Buffer.from('line1\r\nline2\r\nline3', 'utf8');
      const result = normalizeLineEndings(buffer);

      assert.strictEqual(result, 'line1\nline2\nline3', 'Should convert Buffer CRLF to LF');
      assert.strictEqual(typeof result, 'string', 'Should return string');
    });

    it('should handle Buffer input with LF', () => {
      const buffer = Buffer.from('line1\nline2\nline3', 'utf8');
      const result = normalizeLineEndings(buffer);

      assert.strictEqual(result, 'line1\nline2\nline3', 'Should preserve Buffer LF');
    });

    it('should handle empty string', () => {
      const result = normalizeLineEndings('');

      assert.strictEqual(result, '', 'Should return empty string');
    });

    it('should handle null/undefined', () => {
      const resultNull = normalizeLineEndings(null);
      const resultUndefined = normalizeLineEndings(undefined);

      assert.strictEqual(resultNull, null, 'Should return null for null');
      assert.strictEqual(resultUndefined, undefined, 'Should return undefined for undefined');
    });

    it('should handle content without line breaks', () => {
      const content = 'single line content';
      const result = normalizeLineEndings(content);

      assert.strictEqual(result, 'single line content', 'Should preserve single line');
    });
  });

  describe('hasRequiredFields', () => {
    it('should return true when all required fields are present', () => {
      const obj = {
        layout: 'blog-post',
        title: 'Test Post',
        publicationDate: '2025-01-01',
      };
      const required = ['layout', 'title', 'publicationDate'];

      const result = hasRequiredFields(obj, required);

      assert.strictEqual(result, true, 'Should validate all required fields present');
    });

    it('should return false when required fields are missing', () => {
      const obj = {
        layout: 'blog-post',
        title: 'Test Post',
        // missing publicationDate
      };
      const required = ['layout', 'title', 'publicationDate'];

      const result = hasRequiredFields(obj, required);

      assert.strictEqual(result, false, 'Should detect missing required field');
    });

    it('should return true with extra fields present', () => {
      const obj = {
        layout: 'blog-post',
        title: 'Test Post',
        publicationDate: '2025-01-01',
        excerpt: 'Optional excerpt',
        tags: ['tag1', 'tag2'],
      };
      const required = ['layout', 'title', 'publicationDate'];

      const result = hasRequiredFields(obj, required);

      assert.strictEqual(result, true, 'Should ignore extra optional fields');
    });

    it('should return false for empty object', () => {
      const obj = {};
      const required = ['layout', 'title', 'publicationDate'];

      const result = hasRequiredFields(obj, required);

      assert.strictEqual(result, false, 'Should return false for empty object');
    });

    it('should return true for empty required fields array', () => {
      const obj = { layout: 'blog-post' };
      const required = [];

      const result = hasRequiredFields(obj, required);

      assert.strictEqual(result, true, 'Should return true when no fields required');
    });

    it('should handle null object', () => {
      const obj = null;
      const required = ['layout'];

      const result = hasRequiredFields(obj, required);

      assert.strictEqual(result, false, 'Should return false for null object');
    });

    it('should handle undefined object', () => {
      const obj = undefined;
      const required = ['layout'];

      const result = hasRequiredFields(obj, required);

      assert.strictEqual(result, false, 'Should return false for undefined object');
    });

    it('should handle non-array required fields', () => {
      const obj = { layout: 'blog-post' };
      const required = 'not-an-array';

      const result = hasRequiredFields(obj, required);

      assert.strictEqual(result, false, 'Should return false for non-array required fields');
    });

    it('should handle fields with falsy values', () => {
      const obj = {
        layout: 'blog-post',
        title: '', // empty string
        publicationDate: 0, // zero
      };
      const required = ['layout', 'title', 'publicationDate'];

      const result = hasRequiredFields(obj, required);

      assert.strictEqual(
        result,
        true,
        'Should validate presence of fields even with falsy values'
      );
    });
  });

  describe('extractFrontMatter', () => {
    it('should extract front matter from vfile', () => {
      const file = {
        data: {
          matter: {
            layout: 'blog-post',
            title: 'Test Post',
            publicationDate: '2025-01-01',
          },
        },
      };

      const result = extractFrontMatter(file);

      assert.deepStrictEqual(result, {
        layout: 'blog-post',
        title: 'Test Post',
        publicationDate: '2025-01-01',
      });
    });

    it('should return null when file has no data', () => {
      const file = {};

      const result = extractFrontMatter(file);

      assert.strictEqual(result, null, 'Should return null for file without data');
    });

    it('should return null when file has no matter', () => {
      const file = {
        data: {},
      };

      const result = extractFrontMatter(file);

      assert.strictEqual(result, null, 'Should return null for file without matter');
    });

    it('should return null for null file', () => {
      const result = extractFrontMatter(null);

      assert.strictEqual(result, null, 'Should return null for null file');
    });

    it('should return null for undefined file', () => {
      const result = extractFrontMatter(undefined);

      assert.strictEqual(result, null, 'Should return null for undefined file');
    });

    it('should extract front matter with optional fields', () => {
      const file = {
        data: {
          matter: {
            layout: 'blog-post',
            title: 'Test Post',
            publicationDate: '2025-01-01',
            excerpt: 'Test excerpt',
            tags: ['javascript', 'nodejs'],
            coverImage: 'image.jpg',
          },
        },
      };

      const result = extractFrontMatter(file);

      assert.ok(result.excerpt, 'Should include optional excerpt');
      assert.ok(Array.isArray(result.tags), 'Should include optional tags');
      assert.ok(result.coverImage, 'Should include optional coverImage');
    });
  });

  describe('Front Matter Integration with vfile-matter', () => {
    it('should parse valid front matter with all required fields', () => {
      const content = `---
layout: 'blog-post'
title: 'Test Post'
publicationDate: '2025-01-01'
---

This is the post content.`;

      const file = new VFile({
        value: content,
        path: 'test.md',
      });

      matter(file, { strip: true });
      const frontMatter = extractFrontMatter(file);

      assert.ok(frontMatter, 'Should extract front matter');
      assert.strictEqual(frontMatter.layout, 'blog-post');
      assert.strictEqual(frontMatter.title, 'Test Post');
      assert.strictEqual(frontMatter.publicationDate, '2025-01-01');
    });

    it('should parse front matter with CRLF line endings', () => {
      const content = `---\r\nlayout: 'blog-post'\r\ntitle: 'Test Post'\r\npublicationDate: '2025-01-01'\r\n---\r\n\r\nThis is the post content.`;
      const normalized = normalizeLineEndings(content);

      const file = new VFile({
        value: normalized,
        path: 'test.md',
      });

      matter(file, { strip: true });
      const frontMatter = extractFrontMatter(file);

      assert.ok(frontMatter, 'Should extract front matter from CRLF content');
      assert.strictEqual(frontMatter.layout, 'blog-post');
      assert.strictEqual(frontMatter.title, 'Test Post');
    });

    it('should parse front matter with optional fields', () => {
      const content = `---
layout: 'blog-post'
title: 'Test Post'
publicationDate: '2025-01-01'
excerpt: 'This is an excerpt'
tags:
  - javascript
  - nodejs
coverImage: 'cover.jpg'
---

Content here.`;

      const file = new VFile({
        value: content,
        path: 'test.md',
      });

      matter(file, { strip: true });
      const frontMatter = extractFrontMatter(file);

      assert.strictEqual(frontMatter.excerpt, 'This is an excerpt');
      assert.deepStrictEqual(frontMatter.tags, ['javascript', 'nodejs']);
      assert.strictEqual(frontMatter.coverImage, 'cover.jpg');
    });

    it('should handle front matter with special characters', () => {
      const content = `---
layout: 'blog-post'
title: 'Test: A "Special" Post & More'
publicationDate: '2025-01-01'
---

Content.`;

      const file = new VFile({
        value: content,
        path: 'test.md',
      });

      matter(file, { strip: true });
      const frontMatter = extractFrontMatter(file);

      assert.strictEqual(frontMatter.title, 'Test: A "Special" Post & More');
    });

    it('should handle front matter with YAML arrays', () => {
      const content = `---
layout: 'blog-post'
title: 'Test Post'
publicationDate: '2025-01-01'
tags:
  - tag-one
  - tag-two
  - tag-three
---

Content.`;

      const file = new VFile({
        value: content,
        path: 'test.md',
      });

      matter(file, { strip: true });
      const frontMatter = extractFrontMatter(file);

      assert.ok(Array.isArray(frontMatter.tags), 'Tags should be an array');
      assert.strictEqual(frontMatter.tags.length, 3);
      assert.deepStrictEqual(frontMatter.tags, ['tag-one', 'tag-two', 'tag-three']);
    });

    it('should handle file without front matter', () => {
      const content = `This is just content without front matter.`;

      const file = new VFile({
        value: content,
        path: 'test.md',
      });

      matter(file, { strip: true });
      const frontMatter = extractFrontMatter(file);

      // vfile-matter should not create matter if there's no front matter
      assert.ok(
        !frontMatter || Object.keys(frontMatter).length === 0,
        'Should not extract front matter when none exists'
      );
    });

    it('should validate required fields are present', () => {
      const content = `---
layout: 'blog-post'
title: 'Test Post'
publicationDate: '2025-01-01'
---

Content.`;

      const file = new VFile({
        value: content,
        path: 'test.md',
      });

      matter(file, { strip: true });
      const frontMatter = extractFrontMatter(file);
      const required = ['layout', 'title', 'publicationDate'];

      const isValid = hasRequiredFields(frontMatter, required);

      assert.strictEqual(isValid, true, 'Should validate all required fields');
    });

    it('should detect missing required fields', () => {
      const content = `---
layout: 'blog-post'
title: 'Test Post'
---

Content.`;

      const file = new VFile({
        value: content,
        path: 'test.md',
      });

      matter(file, { strip: true });
      const frontMatter = extractFrontMatter(file);
      const required = ['layout', 'title', 'publicationDate'];

      const isValid = hasRequiredFields(frontMatter, required);

      assert.strictEqual(isValid, false, 'Should detect missing publicationDate');
    });
  });
});

